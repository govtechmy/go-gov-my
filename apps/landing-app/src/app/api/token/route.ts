import { NextRequest, NextResponse } from 'next/server';
import { sign } from 'jsonwebtoken';
import { TokenResponse } from '@/types/token';


function generateSecurityHash(timestamp: number): string {
  const secretKey = process.env.API_SECRET_KEY || '';
  return sign({ timestamp }, secretKey, { expiresIn: '60s' });
}

export async function GET(request: NextRequest): Promise<NextResponse<TokenResponse>> {
  try {

    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
    if (!baseUrl) {
      throw new Error('API base URL is not configured');
    }

    // Generate security timestamp and hash
    const timestamp = Date.now();
    const securityHash = generateSecurityHash(timestamp);

    const response = await fetch(`${baseUrl}/api/generate-token`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-Security-Timestamp': timestamp.toString(),
        'X-Security-Hash': securityHash,
        'X-API-Key': process.env.API_SECRET_KEY || '',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Error: ${response}`);
    }

    const data = await response.json();

    return NextResponse.json(data, { 
      status: 200,
      headers: {
        'Access-Control-Allow-Methods': 'GET',
      }
    });

  } catch (error) {
    console.error('Generate Token API Error:', error);
    return NextResponse.json(
      { 
        token: '', 
        error: `Failed to generate token: ${error}` 
      },
      { 
        status: 500 
      }
    );
  }
}