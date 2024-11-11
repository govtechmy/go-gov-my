import { withSession } from '@/lib/auth';
import { logRequestMetrics } from '@/lib/decorator/logRequestMetrics';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// GET /api/me - get the current user
export const GET = logRequestMetrics(
  withSession(async ({ session }) => {
    const user = await prisma.user.findUnique({
      where: {
        id: session.user.id,
      },
    });
    return NextResponse.json(user);
  })
);
