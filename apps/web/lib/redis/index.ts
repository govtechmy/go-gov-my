import {
  DomainProps,
  LinkProps,
  RedisDomainProps,
  RedisLinkProps,
} from "@/lib/types";
import { isIframeable } from "@dub/utils";
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
