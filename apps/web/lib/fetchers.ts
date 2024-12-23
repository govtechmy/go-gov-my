import { prisma } from '@/lib/prisma';
import { getSession } from './auth';

export const getDefaultWorkspace = async () => {
  const session = await getSession();
  if (!session) {
    return null;
  }
  return await prisma.project.findFirst({
    where: {
      users: {
        some: {
          userId: session.user.id,
        },
      },
    },
    select: {
      slug: true,
    },
  });
};

export const getWorkspace = async ({ slug }: { slug: string }) => {
  const session = await getSession();
  if (!session) {
    return null;
  }
  return await prisma.project.findUnique({
    where: {
      slug,
    },
    select: {
      id: true,
      name: true,
      slug: true,
      logo: true,
      usage: true,
      usageLimit: true,
      plan: true,
      billingCycleStart: true,
      createdAt: true,
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
};

export const getLink = async ({ domain, key }: { domain: string; key: string }) => {
  return await prisma.link.findUnique({
    where: {
      domain_key: {
        domain,
        key,
      },
    },
  });
};
