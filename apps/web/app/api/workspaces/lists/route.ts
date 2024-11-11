import { withSession } from '@/lib/auth';
import { logRequestMetrics } from '@/lib/decorator/logRequestMetrics';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { z } from 'zod';

const GetWorkspacesSearchParams = z.object({
  workspaceId: z.string(),
});

// GET /api/workspaces/lists?workspaceId= - get all links by workspaceId
export const GET = logRequestMetrics(
  withSession(async ({ searchParams }) => {
    let { workspaceId } = await GetWorkspacesSearchParams.parseAsync(searchParams);
    if (workspaceId.startsWith('ws_')) {
      workspaceId = workspaceId.replace('ws_', '');
    }
    const links = await prisma.link.findMany({
      where: {
        projectId: workspaceId,
      },
      select: {
        domain: true,
        key: true,
        clicks: true,
      },
    });

    return NextResponse.json(links);
  })
);
