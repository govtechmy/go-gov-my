import { withSession } from '@/lib/auth';
import { logRequestMetrics } from '@/lib/decorator/logRequestMetrics';
import { prisma } from '@/lib/prisma';
import { redis } from '@/lib/redis';
import { storage } from '@/lib/storage';
import { trim } from '@dub/utils';
import { NextResponse } from 'next/server';
import { z } from 'zod';

// GET /api/user – get a specific user
export const GET = logRequestMetrics(
  withSession(async ({ session }) => {
    const user = await prisma.user.findUnique({
      where: {
        id: session.user.id,
      },
    });

    const migratedWorkspace = await redis.hget('migrated_links_users', session.user.id);

    if (migratedWorkspace) {
      await redis.hdel('migrated_links_users', session.user.id);
    }

    return NextResponse.json({
      ...user,
      migratedWorkspace,
    });
  })
);

const updateUserSchema = z.object({
  name: z.preprocess(trim, z.string().min(1).max(64)).optional(),
  email: z.preprocess(trim, z.string().email()).optional(),
  image: z.string().url().optional(),
});

// PUT /api/user – edit a specific user
export const PUT = logRequestMetrics(
  withSession(async ({ req, session }) => {
    let { name, image } = await updateUserSchema.parseAsync(await req.json());
    try {
      if (image) {
        const { url } = await storage.upload(`avatars/${session.user.id}`, image);
        image = url;
      }
      const response = await prisma.user.update({
        where: {
          id: session.user.id,
        },
        data: {
          ...(name && { name }),
          ...(image && { image }),
        },
      });
      return NextResponse.json(response);
    } catch (error) {
      if (error.code === 'P2002') {
        return NextResponse.json(
          {
            error: {
              code: 'conflict',
              message: 'Email is already in use.',
            },
          },
          { status: 422 }
        );
      }
      return NextResponse.json({ error }, { status: 500 });
    }
  })
);

// DELETE /api/user – delete a specific user
export const DELETE = logRequestMetrics(
  withSession(async ({ session }) => {
    const userIsOwnerOfWorkspaces = await prisma.projectUsers.findMany({
      where: {
        userId: session.user.id,
        role: 'owner',
      },
    });
    if (userIsOwnerOfWorkspaces.length > 0) {
      return new Response(
        'You must transfer ownership of your workspaces or delete them before you can delete your account.',
        { status: 422 }
      );
    } else {
      const user = await prisma.user.delete({
        where: {
          id: session.user.id,
        },
      });
      const response = await Promise.allSettled([
        // if the user has a custom avatar, delete it
        user.image?.startsWith(process.env.STORAGE_BASE_URL as string) &&
          storage.delete(`avatars/${session.user.id}`),
      ]);
      return NextResponse.json(response);
    }
  })
);
