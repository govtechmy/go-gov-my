import { LinkProps, RedisLinkProps } from "@/lib/types";
import { Redis } from "ioredis";

if (!process.env.REDIS_URL) {
  throw Error("environment variable 'REDIS_URL' is required");
}

export const redis = new Redis(process.env.REDIS_URL);

export async function formatRedisLink(
  link: LinkProps,
): Promise<RedisLinkProps> {
  const {
    id,
    domain,
    url,
    password,
    proxy,
    expiresAt,
    expiredUrl,
    ios,
    android,
    geo,
    projectId,
  } = link;
  const hasPassword = password && password.length > 0 ? true : false;

  return {
    id,
    url,
    ...(hasPassword && { password: true }),
    ...(proxy && { proxy: true }),
    ...(expiresAt && { expiresAt: new Date(expiresAt) }),
    ...(expiredUrl && { expiredUrl }),
    ...(ios && { ios }),
    ...(android && { android }),
    ...(geo && { geo: geo as object }),
    ...(projectId && { projectId }), // projectId can be undefined for anonymous links
  };
}
