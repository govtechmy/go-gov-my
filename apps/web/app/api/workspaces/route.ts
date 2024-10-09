import { DubApiError } from '@/lib/api/errors';
import { withSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { checkIfUserExists } from '@/lib/userinfos';
import {
  WorkspaceSchema,
  createWorkspaceSchema,
} from '@/lib/zod/schemas/workspaces';
import { nanoid } from '@dub/utils';
import { Prisma } from '@prisma/client';
import { NextResponse } from 'next/server';
import { z } from 'zod';

const GetWorkspacesSearchParams = z.object({
  search: z.string().optional(),
});

// GET /api/workspaces - get all projects for the current user
export const GET = //logRequestMetrics(
  withSession(async ({ session, searchParams }) => {
    const { search } = await GetWorkspacesSearchParams.parseAsync(searchParams);
    let whereQuery: Prisma.ProjectWhereInput = {};

    switch (session.user.role) {
      // Staff can only get workspaces where they are a member
      case 'staff':
        whereQuery = {
          users: {
            some: { userId: session.user.id },
          },
        };
        break;
      // Super admins can get all workspaces from their agency
      case 'super_admin':
        whereQuery = {
          agencyCode: session.user.agencyCode,
        };
        break;
      default:
        throw Error(`Unknown user role '${session.user.role}'`);
    }

    const projects = await prisma.project.findMany({
      where: {
        ...whereQuery,
        ...(search && {
          OR: [
            {
              name: { contains: search },
            },
            {
              slug: { contains: search },
            },
          ],
        }),
      },
      include: {
        users: {
          where: {
            userId: session.user.id,
          },
          select: {
            role: true,
          },
        },
      },
    });

    return NextResponse.json(
      projects.map((project) =>
        WorkspaceSchema.parse({ ...project, id: `ws_${project.id}` }),
      ),
    );
  }); //,
//);

export const POST = withSession(async ({ req, session }) => {
  const { name, slug } = await createWorkspaceSchema.parseAsync(
    await req.json(),
  );

  const userExists = await checkIfUserExists(session.user.id);

  if (!userExists) {
    throw new DubApiError({
      code: 'not_found',
      message: 'Session expired. Please log in again.',
    });
  }

  const freeWorkspaces = await prisma.project.count({
    where: {
      //// Remove filter for free workspaces
      // plan: "free",
      users: {
        some: {
          userId: session.user.id,
          role: 'owner',
        },
      },
    },
  });

  //// Remove filter for free workspaces
  // if (freeWorkspaces >= FREE_WORKSPACES_LIMIT) {
  //   throw new DubApiError({
  //     code: "exceeded_limit",
  //     message: `You can only create up to ${FREE_WORKSPACES_LIMIT} free workspaces. Additional workspaces require a paid plan.`,
  //   });
  // }

  const slugExist = await prisma.project.findUnique({
    where: {
      slug,
    },
    select: {
      slug: true,
    },
  });

  if (slugExist) {
    throw new DubApiError({
      code: 'conflict',
      message: 'Slug is already in use.',
    });
  }

  const projectResponse = await prisma.project.create({
    data: {
      name,
      slug,
      plan: 'business',
      users: {
        create: {
          userId: session.user.id,
          role: 'owner',
        },
      },
      billingCycleStart: new Date().getDate(),
      inviteCode: nanoid(24),
      defaultDomains: {
        create: {}, // by default, we give users all the default domains when they create a project
      },
    },
    include: {
      users: {
        select: {
          role: true,
        },
      },
    },
  });

  const response = {
    ...projectResponse,
    id: `ws_${projectResponse.id}`,
  };

  return NextResponse.json(response);
});
