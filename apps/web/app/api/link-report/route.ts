import { verifyRequestToken } from '@/lib/auth/requestToken';
import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

type LinkReportRequest = {
  url: string;
};

type LinkReportResponse = {
  status: boolean;
};

export async function POST(req: NextRequest) {
  // Authentication check
  const authToken = req.headers.get('x-request-token');
  if (!authToken || !verifyRequestToken(authToken)) {
    return NextResponse.json(
      { message: 'Missing or invalid request token' },
      { status: 401 },
    );
  }

  try {
    const body = await req.json();
    const { url } = body as LinkReportRequest;

    if (!url) {
      return NextResponse.json(
        {
          message: 'Invalid payload',
        },
        { status: 400 },
      );
    }

    try {
      // Save the reported URL to the database
      await prisma.reportedLink.create({
        data: {
          url,
          createdAt: new Date(),
          ipAddress: req.headers.get('x-forwarded-for') || 'unknown',
          userAgent: req.headers.get('user-agent') || 'unknown',
        },
      });

      const response: LinkReportResponse = {
        status: true,
      };

      return NextResponse.json(response, { status: 200 });
    } catch (urlError) {
      console.error('Error saving reported link:', urlError);
      return NextResponse.json(
        {
          status: false,
          error: urlError,
        } as LinkReportResponse,
        { status: 200 },
      );
    }
  } catch (error) {
    console.error('Link report error:', error);
    return NextResponse.json(
      { message: 'Internal server error', error: error },
      { status: 500 },
    );
  }
}
