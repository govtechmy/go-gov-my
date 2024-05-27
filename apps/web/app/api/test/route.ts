import { redis } from "@/lib/redis";
import { NextRequest } from "next/server";

export function GET(req: NextRequest) {
  return new Response(
    JSON.stringify(
      {
        req_headers: req.headers,
        redis_options: redis.options,
      },
      null,
      2,
    ),
  );
}
