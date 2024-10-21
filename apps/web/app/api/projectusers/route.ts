import { withSession } from '@/lib/auth';
import { logRequestMetrics } from '@/lib/decorator/logRequestMetrics';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

// GET /api/projectusers – get a specific user's project users by workspaceId
export const GET = logRequestMetrics(
  withSession(async (req) => {
    const { session, searchParams } = req;
    const workspaceId = searchParams.workspaceId || '';
    const cleanedId = workspaceId.replace('ws_', ''); // Remove the "ws_" prefix

    const projectUsers = await prisma.projectUsers.findMany({
      where: {
        userId: session.user.id, // Assuming 'id' is the correct unique identifier
        projectId: cleanedId,
      },
    });

    return NextResponse.json({
      projectUsers,
    });
  }),
);
