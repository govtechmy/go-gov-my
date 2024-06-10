import { isIframeable } from "@dub/utils";
import { Redis } from "@upstash/redis";
import {
  DomainProps,
  LinkProps,
  RedisDomainProps,
  RedisLinkProps,
} from "./types";

// Initiate Redis instance by connecting to REST URL
export const upstashRedis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || "",
  token: process.env.UPSTASH_REDIS_REST_TOKEN || "",
});

export async function formatRedisLink(
  link: LinkProps,
): Promise<RedisLinkProps> {
  const {
    id,
    domain,
    url,
    password,
    proxy,
    rewrite,
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
    ...(rewrite && {
      rewrite: true,
      iframeable: await isIframeable({ url, requestDomain: domain }),
    }),
    ...(expiresAt && { expiresAt: new Date(expiresAt) }),
    ...(expiredUrl && { expiredUrl }),
    ...(ios && { ios }),
    ...(android && { android }),
    ...(geo && { geo: geo as object }),
    ...(projectId && { projectId }), // projectId can be undefined for anonymous links
  };
}

export async function formatRedisDomain(
  domain: DomainProps,
): Promise<RedisDomainProps> {
  const { id, slug, target: url, type, projectId } = domain;

  return {
    id,
    ...(url && { url }), // on free plans you cannot set a root domain redirect, hence URL is undefined
    ...(url &&
      type === "rewrite" && {
        rewrite: true,
        iframeable: await isIframeable({ url, requestDomain: slug }),
      }),
    projectId,
  };
}
