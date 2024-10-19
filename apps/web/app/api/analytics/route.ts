import { withWorkspace } from '@/lib/auth';
import { logRequestMetrics } from '@/lib/decorator/logRequestMetrics';
import { prisma } from '@/lib/prisma';
import { getLink } from '@/lib/userinfos';
import z from '@/lib/zod';
import { domainKeySchema } from '@/lib/zod/schemas/links';
import { NextResponse } from 'next/server';

const updatePublicStatsSchema = z.object({
  publicStats: z.boolean(),
});

// GET /api/analytics – get the publicStats setting for a link
export const GET = logRequestMetrics(
  withWorkspace(async ({ searchParams }) => {
    const { domain, key } = domainKeySchema.parse(searchParams);
    const response = await getLink({ domain, key });
    return NextResponse.json(response);
  }),
);

// PUT /api/analytics – update the publicStats setting for a link
export const PUT = logRequestMetrics(
  withWorkspace(async ({ req, searchParams }) => {
    const { domain, key } = domainKeySchema.parse(searchParams);
    const { publicStats } = updatePublicStatsSchema.parse(await req.json());
    const response = await prisma.link.update({
      where: { domain_key: { domain, key } },
      data: { publicStats },
    });
    return NextResponse.json(response);
  }),
);
