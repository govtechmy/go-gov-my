import { withWorkspace } from '@/lib/auth';
import { logRequestMetrics } from '@/lib/decorator/logRequestMetrics';
import { prisma } from '@/lib/prisma';
import { nanoid } from '@dub/utils';
import { NextResponse } from 'next/server';

export const POST = logRequestMetrics(
  withWorkspace(
    async ({ workspace }) => {
      const response = await prisma.project.update({
        where: {
          id: workspace.id,
        },
        data: {
          inviteCode: nanoid(24),
        },
      });

      return NextResponse.json(response);
    },
    {
      requiredRole: ['owner'],
    }
  )
);
