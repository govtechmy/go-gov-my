import { propagateBulkLinkChanges } from '@/lib/api/links';
import { withWorkspace } from '@/lib/auth';
import { logRequestMetrics } from '@/lib/decorator/logRequestMetrics';
import { prisma } from '@/lib/prisma';
import { SimpleLinkProps } from '@/lib/types';
import { NextResponse } from 'next/server';

// POST /api/links/sync – sync user's publicly created links to their accounts
export const POST = logRequestMetrics(
  withWorkspace(async ({ req, session, workspace }) => {
    let links: SimpleLinkProps[] = [];
    try {
      links = await req.json();
      if (!Array.isArray(links)) {
        throw new Error('Invalid request body.');
      }
    } catch (e) {
      return new Response('Invalid request body.', { status: 400 });
    }

    const unclaimedLinks = await Promise.all(
      links.map(async (link) => {
        return await prisma.link.findUnique({
          where: {
            domain_key: {
              domain: link.domain,
              key: link.key,
            },
            userId: null,
          },
          include: {
            tags: true,
          },
        });
      })
    ).then((links) => links.filter((link) => link !== null));

    if (unclaimedLinks.length === 0) {
      return new Response('No links created.', { status: 200 });
    }

    const response = await Promise.allSettled([
      prisma.link.updateMany({
        where: {
          id: {
            in: unclaimedLinks.map((link) => link!.id),
          },
        },
        data: {
          userId: session.user.id,
          projectId: workspace.id,
          publicStats: false,
        },
      }),
      propagateBulkLinkChanges(
        unclaimedLinks.map((link) => ({
          ...link!,
          userId: session.user.id,
          projectId: workspace.id,
          publicStats: false,
        }))
      ),
    ]);

    return NextResponse.json(response);
  })
);
