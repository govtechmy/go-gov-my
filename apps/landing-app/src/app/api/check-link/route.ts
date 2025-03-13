import { NextRequest, NextResponse } from 'next/server';
import { sign } from 'jsonwebtoken';
import { LinkCheckerRequest, LinkCheckerResponse } from '@/types/check-link-type';


export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Get the request body
    const body = await request.json() as LinkCheckerRequest;

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
    const linkCheckerResponse = await fetch(`${baseUrl}/api/link-checker`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-request-token': body.token,
      },
      body: JSON.stringify({ url: body.url }),
    });


    if (!linkCheckerResponse.ok) {
      throw new Error('Link checker request failed');
    }

    const { isValid, isExpired, agency, validUntil, redirectUrl, shortUrl } = await linkCheckerResponse.json();

    const data: LinkCheckerResponse = {
      isValid,
      isExpired,
      agency,
      validUntil,
      redirectUrl,
      shortUrl,
    };

    return NextResponse.json(data, { 
      status: 200,
      headers: {
        'Access-Control-Allow-Methods': 'POST',
      }
    });

  } catch (error) {
    console.error('Check Link API Error:', error);
    return NextResponse.json(
      { 
        isValid: false,
        isExpired: false,
        agency: null,
        validUntil: null,
        redirectUrl: null,
        error: `Failed to check link: ${error}` 
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