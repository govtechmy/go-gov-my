import { withAdmin } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export const POST = withAdmin(async ({ req }: { req: Request }) => {
  try {
    const { userId } = await req.json();

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { agencyCode: true },
    });

    if (!user?.agencyCode) {
      return NextResponse.json([]);
    }

    // Get all projects for this agency
    const projects = await prisma.project.findMany({
      where: {
        agencyCode: user.agencyCode,
      },
      select: {
        id: true,
        links: {
          select: {
            id: true,
          },
        },
      },
    });

    // Get all link IDs from these projects
    const linkIds = projects.flatMap((project) => project.links.map((link) => link.id));

    // Get analytics for these links
    const analyticsData = await prisma.analytics.findMany({
      where: {
        linkId: {
          in: linkIds,
        },
      },
    });

    return NextResponse.json(analyticsData);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
});
