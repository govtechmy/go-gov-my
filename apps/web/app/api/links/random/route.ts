import { DubApiError, handleAndReturnErrorResponse } from '@/lib/api/errors';
import { ratelimit } from '@/lib/redis/ratelimit';
import { getRandomKey } from '@/lib/userinfos';
import { domainKeySchema } from '@/lib/zod/schemas/links';
import { getSearchParams } from '@dub/utils';
import { ipAddress } from '@vercel/edge';
import { getToken } from 'next-auth/jwt';
import { NextRequest, NextResponse } from 'next/server';

// Issue #22 "[Fix APIs Not Working] Links API" (https://github.com/govtechmy/go-gov-my/issues/22)
// - Disable edge runtime since we are self hosting our database
// export const runtime = "edge";
export const dynamic = 'force-dynamic';

// GET /api/links/random – get a random available link key for a given domain
export const GET = async (req: NextRequest) => {
  try {
    const searchParams = getSearchParams(req.url);
    const { domain } = domainKeySchema.pick({ domain: true }).parse(searchParams);

    // Rate limit if user is not logged in
    const session = await getToken({
      req,
      secret: process.env.NEXTAUTH_SECRET,
    });
    if (!session?.email) {
      const ip = ipAddress(req);
      const { success } = await ratelimit(`links-random:${ip}`);
      if (!success) {
        throw new DubApiError({
          code: 'rate_limit_exceeded',
          message: "Don't DDoS me pls 🥺",
        });
      }
    }

    const response = await getRandomKey({
      domain,
    });
    return NextResponse.json(response);
  } catch (error) {
    return handleAndReturnErrorResponse(error);
  }
};
