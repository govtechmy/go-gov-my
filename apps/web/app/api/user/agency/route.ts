import { withSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

const ITEMS_PER_PAGE = 10;

export const GET = withSession(async ({ session, req }) => {
  const url = new URL(req.url);
  const page = parseInt(url.searchParams.get('page') || '1', 10);
  const search = url.searchParams.get('search') || '';

  if (!['super_admin', 'agency_admin'].includes(session.user.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const where = {
    ...(session.user.role === 'agency_admin'
      ? { agencyCode: session.user.agencyCode }
      : {}),
    OR: [
      { name: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
      { agencyCode: { contains: search, mode: 'insensitive' } },
    ],
  };

  const [users, totalCount] = await Promise.all([
    prisma.user.findMany({
      where: {
        ...where,
        OR: where.OR?.map((condition) => ({
          ...condition,
          name: condition.name
            ? {
                contains: condition.name.contains,
                mode: 'insensitive' as const,
              }
            : undefined,
          email: condition.email
            ? {
                contains: condition.email.contains,
                mode: 'insensitive' as const,
              }
            : undefined,
          agencyCode: condition.agencyCode
            ? {
                contains: condition.agencyCode.contains,
                mode: 'insensitive' as const,
              }
            : undefined,
        })),
      },
      orderBy: { name: 'asc' },
      take: ITEMS_PER_PAGE,
      skip: (page - 1) * ITEMS_PER_PAGE,
    }),
    prisma.user.count({
      where: {
        ...where,
        OR: where.OR?.map((condition) => ({
          ...condition,
          name: condition.name
            ? {
                contains: condition.name.contains,
                mode: 'insensitive' as const,
              }
            : undefined,
          email: condition.email
            ? {
                contains: condition.email.contains,
                mode: 'insensitive' as const,
              }
            : undefined,
          agencyCode: condition.agencyCode
            ? {
                contains: condition.agencyCode.contains,
                mode: 'insensitive' as const,
              }
            : undefined,
        })),
      },
    }),
  ]);

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  return NextResponse.json({
    users,
    totalPages,
    currentPage: page,
  });
});
