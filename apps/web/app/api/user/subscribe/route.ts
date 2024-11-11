import { withSession } from '@/lib/auth';
import { logRequestMetrics } from '@/lib/decorator/logRequestMetrics';
import { prisma } from '@/lib/prisma';
import { log } from '@dub/utils';
import { NextResponse } from 'next/server';

// GET /api/user/subscribe – get a specific user
export const GET = logRequestMetrics(
  withSession(async ({ session }) => {
    const user = await prisma.user.findUnique({
      where: {
        id: session.user.id,
      },
      select: {
        id: true,
        name: true,
        email: true,
        subscribed: true,
      },
    });

    if (!user) {
      return new Response('User not found', { status: 404 });
    }

    return NextResponse.json(user);
  })
);

// POST /api/user/subscribe – subscribe a specific user
export const POST = logRequestMetrics(
  withSession(async ({ session }) => {
    const [user, _] = await Promise.all([
      prisma.user.update({
        where: {
          id: session.user.id,
        },
        data: {
          subscribed: true,
        },
        select: {
          id: true,
          name: true,
          email: true,
          subscribed: true,
        },
      }),
      log({
        message: `*${session.user.email}* resubscribed to the newsletter. Manual addition required.`,
        type: 'alerts',
      }),
    ]);

    return NextResponse.json(user);
  })
);

// DELETE /api/user/subscribe – unsubscribe a specific user
export const DELETE = logRequestMetrics(
  withSession(async ({ session }) => {
    const [user] = await Promise.all([
      prisma.user.update({
        where: {
          id: session.user.id,
        },
        data: {
          subscribed: false,
        },
        select: {
          id: true,
          name: true,
          email: true,
          subscribed: true,
        },
      }),
    ]);

    return NextResponse.json(user);
  })
);
