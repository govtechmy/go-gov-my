import { getClicks } from '@/lib/analytics/clicks';
import { DubApiError } from '@/lib/api/errors';
import { withWorkspace } from '@/lib/auth';
import { logRequestMetrics } from '@/lib/decorator/logRequestMetrics';
import { prisma } from '@/lib/prisma';
import { formatRedisLink, redis } from '@/lib/redis';
import z from '@/lib/zod';
import { trace } from '@opentelemetry/api';
import { waitUntil } from '@vercel/functions';
import { NextResponse } from 'next/server';

const transferLinkBodySchema = z.object({
  newWorkspaceId: z
    .string()
    .min(1, 'Missing new workspace ID.')
    // replace "ws_" with "" to get the workspace ID
    .transform((v) => v.replace('ws_', '')),
});

// POST /api/links/[linkId]/transfer – transfer a link to another workspace
export const POST = logRequestMetrics(
  withWorkspace(async ({ req, headers, session, params, workspace }) => {
    const { newWorkspaceId } = transferLinkBodySchema.parse(await req.json());
    const tracer = trace.getTracer('default');
    const span = tracer.startSpan('recordLinks');

    const newWorkspace = await prisma.project.findUnique({
      where: { id: newWorkspaceId },
      select: {
        linksUsage: true,
        linksLimit: true,
        users: {
          where: {
            userId: session.user.id,
          },
          select: {
            role: true,
          },
        },
      },
    });

    const link = await prisma.link.findUnique({
      where: {
        id: params.linkId,
      },
      include: {
        tags: true,
      },
    });
    // technically this is not needed since the link is already checked in withWorkspace
    if (!link) {
      throw new DubApiError({
        code: 'not_found',
        message: 'Link not found.',
      });
    }

    if (!newWorkspace || newWorkspace.users.length === 0) {
      throw new DubApiError({
        code: 'not_found',
        message: 'New workspace not found.',
      });
    }

    if (newWorkspace.linksUsage >= newWorkspace.linksLimit) {
      throw new DubApiError({
        code: 'forbidden',
        message: 'New workspace has reached its link limit.',
      });
    }

    const linkClicks = await getClicks({
      linkId: link.id,
      interval: '30d',
    });

    const response = await prisma.link.update({
      where: {
        id: link.id,
      },
      data: {
        projectId: newWorkspaceId,
        // remove tags when transferring link
        tags: {
          deleteMany: {},
        },
      },
    });

    try {
      waitUntil(
        Promise.all([
          redis.hset(link.domain.toLowerCase(), {
            [link.key.toLowerCase()]: JSON.stringify(
              await formatRedisLink({
                ...link,
                projectId: newWorkspaceId,
              })
            ),
          }),
          // decrement old workspace usage
          prisma.project.update({
            where: {
              id: workspace.id,
            },
            data: {
              usage: {
                decrement: linkClicks,
              },
              linksUsage: {
                decrement: 1,
              },
            },
          }),
          // increment new workspace usage
          prisma.project.update({
            where: {
              id: newWorkspaceId,
            },
            data: {
              usage: {
                increment: linkClicks,
              },
              linksUsage: {
                increment: 1,
              },
            },
          }),
        ])
      );

      // Log results to OpenTelemetry
      span.addEvent('recordLinks', {
        link_id: link.id,
        domain: link.domain,
        key: link.key,
        url: link.url,
        workspace_id: newWorkspaceId,
        created_at: link.createdAt.toISOString(),
        logtime: new Date().toISOString(),
      });

      return NextResponse.json(response, {
        headers,
      });
    } catch (error) {
      span.recordException(error);
      return NextResponse.json({ error: error.message });
    } finally {
      span.end();
    }
  })
);
