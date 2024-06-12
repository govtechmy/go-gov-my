import { formatRedisLink, redis } from "@/lib/redis";
import { RedisLinkProps } from "@/lib/types";
import { getLinkViaEdge } from "@/lib/userinfos";
import { waitUntil } from "@vercel/functions";
import { NextRequest } from "next/server";

export type LinkMiddlewareLinkDataResponse = RedisLinkProps | null;

export async function GET(req: NextRequest) {
  const domain = req.nextUrl.searchParams.get("domain");
  if (!domain) {
    throw Error("search param value 'domain' is required");
  }

  const key = req.nextUrl.searchParams.get("key");
  if (!key) {
    throw Error("search param value 'key' is required");
  }

  let link: RedisLinkProps | null = null;

  const redisResponse = await redis.hget(domain, key);

  if (redisResponse) {
    link = JSON.parse(redisResponse);
  } else {
    // if no link data in redis, try to get it from the DB
    const linkData = await getLinkViaEdge(domain, key);
    if (linkData) {
      // format link to fit the RedisLinkProps interface
      link = await formatRedisLink(linkData as any);

      waitUntil(
        redis.hset(domain, {
          [key]: JSON.stringify(link),
        }),
      );
    }
  }

  const responseData: LinkMiddlewareLinkDataResponse = link;

  return new Response(JSON.stringify(responseData));
}
