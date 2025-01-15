import { AppMiddleware } from '@/lib/middleware';
import { parse } from '@/lib/middleware/utils';
import { NextFetchEvent, NextRequest, NextResponse } from 'next/server';
import AdminMiddleware from './lib/middleware/admin';

export const config = {
  matcher: [
    /*
     * Match all paths except for:
     * 1. /api/ routes
     * 2. /_next/ (Next.js internals)
     * 3. /_proxy/ (special page for OG tags proxying)
     * 4. /_static (inside /public)
     * 5. /_vercel (Vercel internals)
     * 6. Static files (e.g. /favicon.ico, /sitemap.xml, /robots.txt, etc.)
     */
    '/((?!api/|_next/|_proxy/|_static|_vercel|[\\w-]+\\.\\w+).*)',
  ],
};

export default async function middleware(req: NextRequest, ev: NextFetchEvent) {
  const { domain, path, key, pathWithoutLocale } = parse(req);

  // Staging auth
  if (process.env.NEXT_PUBLIC_APP_ENV?.toLocaleLowerCase() === 'staging') {
    // Check cookie first
    const stagingAuth = req.cookies.get('staging-auth')?.value;

    if (stagingAuth) {
      const [timestamp, authValue] = stagingAuth.split('.');
      const expiryTime = parseInt(timestamp);

      // Check if auth is expired (2 hours)
      if (Date.now() > expiryTime) {
        return new NextResponse('Auth expired', {
          status: 401,
          headers: {
            'WWW-Authenticate': 'Basic realm="Secure Area"',
          },
        });
      }

      const [user, password] = atob(authValue).split(':');

      if (user === 'admin' && password === process.env.STAGING_AUTH_PASSWORD) {
        // Let the request continue through the middleware chain
        return AppMiddleware(req);
      }
    }

    // If no valid cookie, check basic auth header
    const basicAuth = req.headers.get('authorization');

    if (basicAuth) {
      const authValue = basicAuth.split(' ')[1];
      const [user, password] = atob(authValue).split(':');

      if (user === 'admin' && password === process.env.STAGING_AUTH_PASSWORD) {
        // Create response and continue through middleware chain
        const response = await AppMiddleware(req);

        // Set cookie with 2 hour expiry
        const expiryTime = Date.now() + 2 * 60 * 60 * 1000; // 2 hours
        const cookieValue = `${expiryTime}.${authValue}`;

        response.cookies.set('staging-auth', cookieValue, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 2 * 60 * 60, // 2 hours in seconds
          path: '/',
        });

        return response;
      }
    }

    return new NextResponse('Auth required', {
      status: 401,
      headers: {
        'WWW-Authenticate': 'Basic realm="Secure Area"',
      },
    });
  }

  // for Admin
  if (pathWithoutLocale.startsWith('/admin')) {
    return AdminMiddleware(req);
  }

  // for App
  return AppMiddleware(req);
}
