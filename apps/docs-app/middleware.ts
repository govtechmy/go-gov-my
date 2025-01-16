import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Skip authentication for static files and api routes if needed
  if (
    request.nextUrl.pathname.startsWith('/_next') ||
    request.nextUrl.pathname.startsWith('/static')
  ) {
    return NextResponse.next();
  }

  const authHeader = request.headers.get('authorization');
  const expectedPassword = process.env.STAGING_AUTH_PASSWORD;

  if (!expectedPassword) {
    console.warn('STAGING_AUTH_PASSWORD not set in environment variables');
    return NextResponse.next();
  }

  if (!authHeader) {
    return new NextResponse('Authentication required', {
      status: 401,
      headers: {
        'WWW-Authenticate': 'Basic realm="Secure Documentation Area"',
      },
    });
  }

  try {
    const encodedCredentials = authHeader.split(' ')[1];
    const decodedCredentials = Buffer.from(encodedCredentials, 'base64').toString();
    const [, password] = decodedCredentials.split(':');

    if (password === expectedPassword) {
      return NextResponse.next();
    }
  } catch (e) {
    // Handle parsing errors
  }

  return new NextResponse('Invalid credentials', {
    status: 401,
    headers: {
      'WWW-Authenticate': 'Basic realm="Secure Documentation Area"',
    },
  });
}

export const config = {
  matcher: '/:path*',
};
