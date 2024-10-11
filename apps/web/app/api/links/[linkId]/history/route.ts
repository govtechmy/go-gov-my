import { DubApiError } from '@/lib/api/errors';
import { withWorkspace } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export const GET = withWorkspace(async ({ link }) => {
  if (!link) {
    throw new DubApiError({
      code: 'not_found',
      message: 'Link not found',
    });
  }

  const history = await prisma.linkHistory.findMany({
    where: {
      linkId: link.id,
    },
    include: {
      committedByUser: true,
    },
    orderBy: {
      timestamp: 'desc',
    },
  });

  return NextResponse.json(history);
});
