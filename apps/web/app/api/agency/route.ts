import { withSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

// GET /api/agency – get a specific user's agency
export const GET = withSession(async ({ session }) => {
  const user = await prisma.agency.findUnique({
    where: {
      code: session.user.agencyCode,
    },
  });

  return NextResponse.json({
    user,
  });
});
