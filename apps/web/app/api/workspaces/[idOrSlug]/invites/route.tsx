import { DubApiError } from '@/lib/api/errors';
import { inviteUser } from '@/lib/api/users';
import { withWorkspace } from '@/lib/auth';
import { logRequestMetrics } from '@/lib/decorator/logRequestMetrics';
import { prisma } from '@/lib/prisma';
import z from '@/lib/zod';
import { NextResponse } from 'next/server';

const emailInviteSchema = z.object({
  email: z.string().email(),
});

function getEmailDomain(email: string): string {
  const match = email.match(/@([a-zA-Z0-9.-]+)$/);
  return match ? match[1] : '';
}

// GET /api/workspaces/[idOrSlug]/invites – get invites for a specific workspace
export const GET = logRequestMetrics(
  withWorkspace(async ({ workspace }) => {
    const invites = await prisma.projectInvite.findMany({
      where: {
        projectId: workspace.id,
      },
      select: {
        email: true,
        createdAt: true,
      },
    });
    return NextResponse.json(invites);
  })
);

// POST /api/workspaces/[idOrSlug]/invites – invite a teammate
export const POST = logRequestMetrics(
  withWorkspace(
    async ({ req, workspace, session }) => {
      const { email } = emailInviteSchema.parse(await req.json());

      const emailDomain = getEmailDomain(email);
      const allAllowedDomains = await prisma.allowedDomains.findMany({
        where: { isActive: true },
      });
      const allowedDomainList = allAllowedDomains.map((domain) => domain.domain.toLowerCase());

      // Check if the email domain is allowed
      if (!allowedDomainList.includes(emailDomain)) {
        return NextResponse.json(
          {
            error: {
              message: 'Email domain not allowed',
            },
          },
          { status: 403 } // 403 Forbidden
        );
      }

      const [alreadyInWorkspace, workspaceUserCount, workspaceInviteCount] = await Promise.all([
        prisma.projectUsers.findFirst({
          where: {
            projectId: workspace.id,
            user: {
              email,
            },
          },
        }),
        prisma.projectUsers.count({
          where: {
            projectId: workspace.id,
          },
        }),
        prisma.projectInvite.count({
          where: {
            projectId: workspace.id,
          },
        }),
      ]);

      if (alreadyInWorkspace) {
        throw new DubApiError({
          code: 'bad_request',
          message: 'User already exists in this workspace.',
        });
      }

      await inviteUser({
        email,
        workspace,
        session,
      });

      return NextResponse.json({ message: 'Invite sent' });
    },
    {
      requiredRole: ['owner'],
    }
  )
);

// DELETE /api/workspaces/[idOrSlug]/invites – delete a pending invite
export const DELETE = logRequestMetrics(
  withWorkspace(
    async ({ searchParams, workspace }) => {
      const { email } = emailInviteSchema.parse(searchParams);
      const response = await prisma.projectInvite.delete({
        where: {
          email_projectId: {
            email,
            projectId: workspace.id,
          },
        },
      });
      return NextResponse.json(response);
    },
    {
      requiredRole: ['owner'],
    }
  )
);
