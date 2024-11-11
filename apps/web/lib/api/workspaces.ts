import { prisma } from '@/lib/prisma';
import { redis } from '@/lib/redis';
import { storage } from '@/lib/storage';
import { DUB_DOMAINS_ARRAY, LEGAL_USER_ID, LEGAL_WORKSPACE_ID } from '@dub/utils';
import { waitUntil } from '@vercel/functions';
import { WorkspaceProps } from '../types';

export async function deleteWorkspace(workspace: Pick<WorkspaceProps, 'id' | 'slug' | 'logo'>) {
  const [defaultDomainLinks] = await Promise.all([
    prisma.link.findMany({
      where: {
        projectId: workspace.id,
        domain: {
          in: DUB_DOMAINS_ARRAY,
        },
      },
      select: {
        id: true,
        domain: true,
        key: true,
        url: true,
        tags: {
          select: {
            tagId: true,
          },
        },
        proxy: true,
        image: true,
        projectId: true,
        createdAt: true,
      },
    }),
  ]);

  const response = await prisma.projectUsers.deleteMany({
    where: {
      projectId: workspace.id,
    },
  });

  waitUntil(
    (async () => {
      const linksByDomain: Record<string, string[]> = {};
      defaultDomainLinks.forEach(async (link) => {
        const { domain, key } = link;

        if (!linksByDomain[domain]) {
          linksByDomain[domain] = [];
        }
        linksByDomain[domain].push(key.toLowerCase());
      });

      const pipeline = redis.pipeline();

      Object.entries(linksByDomain).forEach(([domain, links]) => {
        pipeline.hdel(domain.toLowerCase(), ...links);
      });

      // delete all domains, links, and uploaded images associated with the workspace
      await Promise.allSettled([
        // delete all default domain links from redis
        pipeline.exec(),
        // remove all images from R2
        ...defaultDomainLinks.map(({ id, proxy, image }) =>
          proxy && image?.startsWith(process.env.STORAGE_BASE_URL as string)
            ? storage.delete(`images/${id}`)
            : Promise.resolve()
        ),
      ]);

      await Promise.all([
        // delete workspace logo if it's a custom logo stored in R2
        workspace.logo?.startsWith(process.env.STORAGE_BASE_URL as string) &&
          storage.delete(`logos/${workspace.id}`),
        // delete the workspace
        prisma.project.delete({
          where: {
            slug: workspace.slug,
          },
        }),
      ]);
    })()
  );

  return response;
}

export async function deleteWorkspaceAdmin(
  workspace: Pick<WorkspaceProps, 'id' | 'slug' | 'logo'>
) {
  await prisma.link.updateMany({
    where: {
      projectId: workspace.id,
      domain: {
        in: DUB_DOMAINS_ARRAY,
      },
    },
    data: {
      userId: LEGAL_USER_ID,
      projectId: LEGAL_WORKSPACE_ID,
    },
  });

  const deleteWorkspaceResponse = await Promise.all([
    // delete workspace logo if it's a custom logo stored in R2
    workspace.logo?.startsWith(process.env.STORAGE_BASE_URL as string) &&
      storage.delete(`logos/${workspace.id}`),
    // delete the workspace
    prisma.project.delete({
      where: {
        slug: workspace.slug,
      },
    }),
  ]);

  return {
    deleteWorkspaceResponse,
  };
}
