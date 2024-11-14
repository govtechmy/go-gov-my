import { withAdmin } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export const GET = withAdmin(async ({ req }: { req: Request }) => {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

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
      orderBy: {
        from: 'asc',
      },
      select: {
        from: true,
        metadata: true,
      },
    });

    // Transform the data into the required format with proper metadata handling
    const timeseriesData = analyticsData.map((record) => {
      const metadata = record.metadata as { clicks?: number };
      return {
        start: record.from,
        clicks: typeof metadata === 'object' && metadata ? metadata.clicks || 0 : 0,
      };
    });

    // Group by date and sum clicks
    const groupedData = timeseriesData.reduce(
      (acc, curr) => {
        // Format date to match the example: "Tue Nov 05 2024 08:00:00 GMT+0800 (Malaysia Time)"
        const date = curr.start.toString();
        if (!acc[date]) {
          acc[date] = { start: date, clicks: 0 };
        }
        acc[date].clicks += curr.clicks;
        return acc;
      },
      {} as Record<string, { start: string; clicks: number }>
    );

    // Convert back to array and sort by date
    const result = Object.values(groupedData).sort(
      (a, b) => new Date(a.start).getTime() - new Date(b.start).getTime()
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
});
