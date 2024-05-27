import { redis } from "@/lib/redis";
import { RedisDomainProps } from "@/lib/types";
import { formatRedisDomain } from "@/lib/upstash";
import { getDomainViaEdge } from "@/lib/userinfos";
import { waitUntil } from "@vercel/functions";
import { NextRequest } from "next/server";

export type RootMiddlewareLinkDataResponse = Pick<
  RedisDomainProps,
  "id" | "url" | "rewrite" | "iframeable"
> | null;

export async function GET(req: NextRequest) {
  const domain = req.nextUrl.searchParams.get("domain");
  if (!domain) {
    throw Error("search param value 'domain' is required");
  }

  let link: RedisDomainProps | null = null;

  const redisResponse = await redis.hget(domain, "_root");

  if (redisResponse) {
    link = JSON.parse(redisResponse);
  } else {
    // if no link data in redis, try to get it from the DB
    const linkData = await getDomainViaEdge(domain);
    if (linkData) {
      // format link to fit the RedisLinkProps interface
      link = await formatRedisDomain(linkData as any);

      waitUntil(
        redis.hset(domain, {
          _root: link,
        }),
      );
    }
  }

  const responseData: RootMiddlewareLinkDataResponse = link
    ? {
        id: link.id,
        url: link.url,
        rewrite: link.rewrite,
        iframeable: link.iframeable,
      }
    : null;

  return new Response(JSON.stringify(responseData));
}
