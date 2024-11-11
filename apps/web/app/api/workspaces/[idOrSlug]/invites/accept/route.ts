import { withSession } from '@/lib/auth';
import { logRequestMetrics } from '@/lib/decorator/logRequestMetrics';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

// POST /api/workspaces/[idOrSlug]/invites/accept – accept a workspace invite
export const POST = logRequestMetrics(
  withSession(async ({ session, params }) => {
    const { idOrSlug: slug } = params;
    const invite = await prisma.projectInvite.findFirst({
      where: {
        email: session.user.email,
        project: {
          slug,
        },
      },
      select: {
        expires: true,
        project: {
          select: {
            id: true,
            plan: true,
          },
        },
      },
    });
    if (!invite) {
      return new Response('Invalid invite', { status: 404 });
    }

    if (invite && invite.expires && invite.expires < new Date()) {
      return new Response('Invite expired', { status: 410 });
    }

    const workspace = invite.project;

    const response = await Promise.all([
      prisma.projectUsers.create({
        data: {
          userId: session.user.id,
          role: 'member',
          projectId: workspace.id,
        },
      }),
      prisma.projectInvite.delete({
        where: {
          email_projectId: {
            email: session.user.email,
            projectId: workspace.id,
          },
        },
      }),
    ]);
    return NextResponse.json(response);
  })
);
