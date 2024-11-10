import { generateRequestToken } from '@/lib/auth/requestToken';
import { verify } from 'jsonwebtoken';
import { NextRequest, NextResponse } from 'next/server';

function verifySecurityHash(timestamp: string, hash: string): boolean {
  try {
    const secretKey = process.env.API_SECRET_KEY || '';
    const decoded = verify(hash, secretKey);
    return (
      (decoded as { timestamp: string }).timestamp.toString() === timestamp
    );
  } catch {
    return false;
  }
}

export async function GET(request: NextRequest) {
  try {
    // Verify API key
    const apiKey = request.headers.get('X-API-Key');
    if (apiKey !== process.env.API_SECRET_KEY) {
      return NextResponse.json({ error: 'Invalid API key' }, { status: 401 });
    }

    // Verify security hash
    const timestamp = request.headers.get('X-Security-Timestamp');
    const securityHash = request.headers.get('X-Security-Hash');

    if (
      !timestamp ||
      !securityHash ||
      !verifySecurityHash(timestamp, securityHash)
    ) {
      return NextResponse.json(
        { error: 'Invalid security credentials' },
        { status: 401 },
      );
    }

    // Generate token if all security checks pass
    const { token } = generateRequestToken();
    return NextResponse.json({ token });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
