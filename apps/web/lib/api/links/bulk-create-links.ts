import { prisma } from '@/lib/prisma';
import { formatRedisLink, redis } from '@/lib/redis';
import { LinkProps, ProcessedLinkProps, RedisLinkProps } from '@/lib/types';
import { getParamsFromURL, truncate } from '@dub/utils';
import { trace } from '@opentelemetry/api';
import { combineTagIds, transformLink } from './utils';

export async function bulkCreateLinks({ links }: { links: ProcessedLinkProps[] }) {
  if (links.length === 0) return [];

  // create links via Promise.all (because Prisma doesn't support nested createMany)
  // ref: https://github.com/prisma/prisma/issues/8131#issuecomment-997667070
  const createdLinks = await Promise.all(
    links.map(({ tagId, tagIds, tagNames, ...link }) => {
      const { utm_source, utm_medium, utm_campaign, utm_term, utm_content } = getParamsFromURL(
        link.url
      );

      const combinedTagIds = combineTagIds({ tagId, tagIds });

      return prisma.link.create({
        data: {
          ...link,
          title: truncate(link.title, 120),
          description: truncate(link.description, 240),
          utm_source,
          utm_medium,
          utm_campaign,
          utm_term,
          utm_content,
          expiresAt: link.expiresAt ? new Date(link.expiresAt) : null,
          geo: link.geo || undefined,

          // Associate tags by tagNames
          ...(tagNames?.length &&
            link.projectId && {
              tags: {
                create: tagNames.map((tagName) => ({
                  tag: {
                    connect: {
                      name_projectId: {
                        name: tagName,
                        projectId: link.projectId as string,
                      },
                    },
                  },
                })),
              },
            }),

          // Associate tags by IDs (takes priority over tagNames)
          ...(combinedTagIds &&
            combinedTagIds.length > 0 && {
              tags: {
                createMany: {
                  data: combinedTagIds.map((tagId) => ({ tagId })),
                },
              },
            }),
        },
        include: {
          tags: {
            select: {
              tagId: true,
              tag: {
                select: {
                  id: true,
                  name: true,
                  color: true,
                },
              },
            },
          },
        },
      });
    })
  );

  await propagateBulkLinkChanges(createdLinks);

  return createdLinks.map((link) => transformLink(link));
}

export async function propagateBulkLinkChanges(
  links: (LinkProps & { tags: { tagId: string }[] })[]
) {
  const pipeline = redis.pipeline();
  const tracer = trace.getTracer('default');
  const span = tracer.startSpan('recordLinks');

  // split links into domains for better write effeciency in Redis
  const linksByDomain: Record<string, Record<string, RedisLinkProps>> = {};

  await Promise.all(
    links.map(async (link) => {
      const { domain, key } = link;

      if (!linksByDomain[domain]) {
        linksByDomain[domain] = {};
      }
      const formattedLink = await formatRedisLink(link);
      linksByDomain[domain][key.toLowerCase()] = formattedLink;
    })
  );

  Object.entries(linksByDomain).forEach(([domain, links]) => {
    pipeline.hset(domain.toLowerCase(), JSON.stringify(links));
  });

  try {
    await Promise.all([
      // update Redis
      pipeline.exec(),
      // update links usage for workspace
      prisma.project.update({
        where: {
          id: links[0].projectId!, // this will always be present
        },
        data: {
          linksUsage: {
            increment: links.length,
          },
        },
      }),
    ]);
    // Log results to OpenTelemetry
    links.forEach((link) => {
      span.addEvent('recordLinks', {
        link_id: link.id,
        domain: link.domain,
        key: link.key,
        url: link.url,
        tag_ids: link.tags.map((tag) => tag.tagId),
        workspace_id: link.projectId?.toString(),
        created_at: link.createdAt.toISOString(),
        logtime: new Date().toISOString(),
      });
    });
  } catch (error) {
    span.recordException(error);
  } finally {
    span.end();
  }
}
