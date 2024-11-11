import { LinkProps, RedisLinkProps } from '@/lib/types';
import { Redis } from 'ioredis';

export const redis = new Redis(process.env.REDIS_URL!, {
  lazyConnect: true,
});

export async function formatRedisLink(link: LinkProps): Promise<RedisLinkProps> {
  const { id, domain, url, proxy, expiresAt, expiredUrl, ios, android, geo, projectId } = link;

  return {
    id,
    url,
    ...(proxy && { proxy: true }),
    ...(expiresAt && { expiresAt: new Date(expiresAt) }),
    ...(expiredUrl && { expiredUrl }),
    ...(ios && { ios }),
    ...(android && { android }),
    ...(geo && { geo: geo as object }),
    ...(projectId && { projectId }), // projectId can be undefined for anonymous links
  };
}
