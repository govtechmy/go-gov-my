import { DubApiError } from '@/lib/api/errors';
import { withWorkspace } from '@/lib/auth';
import { logRequestMetrics } from '@/lib/decorator/logRequestMetrics';
import { prisma } from '@/lib/prisma';
import { updateTagBodySchema } from '@/lib/zod/schemas/tags';
import { trace } from '@opentelemetry/api';
import { NextResponse } from 'next/server';

// PATCH /api/workspaces/[idOrSlug]/tags/[id] – update a tag for a workspace
export const PATCH = logRequestMetrics(
  withWorkspace(async ({ req, params, workspace }) => {
    const { id } = params;
    const { name, color } = updateTagBodySchema.parse(await req.json());

    const tag = await prisma.tag.findFirst({
      where: {
        id,
        projectId: workspace.id,
      },
    });

    if (!tag) {
      throw new DubApiError({
        code: 'not_found',
        message: 'Tag not found.',
      });
    }

    try {
      const response = await prisma.tag.update({
        where: {
          id,
        },
        data: {
          name,
          color,
        },
      });
      return NextResponse.json(response);
    } catch (error) {
      if (error.code === 'P2002') {
        throw new DubApiError({
          code: 'conflict',
          message: 'A tag with that name already exists.',
        });
      }

      throw error;
    }
  })
);

export const PUT = PATCH;

// DELETE /api/workspaces/[idOrSlug]/tags/[id] – delete a tag for a workspace
export const DELETE = logRequestMetrics(
  withWorkspace(async ({ params, workspace }) => {
    const { id } = params;
    const tracer = trace.getTracer('default');
    const span = tracer.startSpan('recordLinks');

    try {
      const response = await prisma.tag.delete({
        where: {
          id,
          projectId: workspace.id,
        },
        include: {
          links: {
            select: {
              link: {
                select: {
                  id: true,
                  domain: true,
                  key: true,
                  url: true,
                  createdAt: true,
                },
              },
            },
          },
        },
      });

      if (!response) {
        throw new DubApiError({
          code: 'not_found',
          message: 'Tag not found.',
        });
      }

      // Log results to OpenTelemetry
      response.links.forEach((link) => {
        span.addEvent('recordLinks', {
          link_id: link.link.id,
          domain: link.link.domain,
          key: link.link.key,
          url: link.link.url,
          workspace_id: workspace.id,
          created_at: link.link.createdAt.toISOString(),
          logtime: new Date().toISOString(),
        });
      });

      return NextResponse.json(response);
    } catch (error) {
      span.recordException(error);
      if (error.code === 'P2025') {
        throw new DubApiError({
          code: 'not_found',
          message: 'Tag not found.',
        });
      }
      return NextResponse.json({ error: error.message });
    } finally {
      span.end();
    }
  })
);
