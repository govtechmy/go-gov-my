import { NextRequest, NextResponse } from 'next/server';
import { LinkReportRequest, LinkReportResponse } from '@/types/report-link-type';


export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Get the request body
    const body = await request.json() as LinkReportRequest;

    if (!body.url || !body.token) {
      return NextResponse.json(
        { message: 'Invalid payload' },
        { 
          status: 400,
          headers: {
            'Access-Control-Allow-Methods': 'POST',
          }
        }
      );
    }

    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
    if (!baseUrl) {
      throw new Error('API base URL is not configured');
    }

    // First, get the token
    const linkReportResponse = await fetch(`${baseUrl}/api/link-report`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-request-token': body.token,
      },
      body: JSON.stringify({ url: body.url }),
    });


    if (!linkReportResponse.ok) {
      throw new Error('Link report request failed');
    }

    const { status } = await linkReportResponse.json();

    const data: LinkReportResponse = {
      status,
    };

    return NextResponse.json(data, { 
      status: 200,
      headers: {
        'Access-Control-Allow-Methods': 'POST',
      }
    });

  } catch (error) {
    console.error('Report Link API Error:', error);
    return NextResponse.json(
      { 
        status: false,
        error: `Failed to report link: ${error}` 
      },
      { 
        status: 500,
        headers: {
          'Access-Control-Allow-Methods': 'POST',
        }
      }
    );
  }
}