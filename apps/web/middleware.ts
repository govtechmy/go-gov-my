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

  // Check for password authentication
  const authPassword = process.env.AUTH_PASSWORD;
  if (!authPassword) {
    console.warn('AUTH_PASSWORD not set in environment variables');
    return new NextResponse('Server configuration error', { status: 500 });
  }

  // Skip auth for public assets or specific paths if needed
  if (path.includes('/_next') || path.includes('/public')) {
    return NextResponse.next();
  }

  // Check for password in cookie
  const authCookie = req.cookies.get('auth_token');
  if (!authCookie?.value) {
    // If no auth cookie, check for password in query parameter
    const url = new URL(req.url);
    const passwordParam = url.searchParams.get('password');

    if (passwordParam === authPassword) {
      // Set auth cookie and redirect to requested path without password parameter
      const response = NextResponse.redirect(new URL(path, req.url));
      response.cookies.set('auth_token', 'authenticated', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7 days
      });
      return response;
    }

    // If no valid password, redirect to password page
    return new NextResponse(
      `
      <html>
        <head>
          <title>Password Required</title>
        </head>
        <body>
          <form method="get">
            <input type="password" name="password" placeholder="Enter password" />
            <button type="submit">Submit</button>
          </form>
        </body>
      </html>
      `,
      {
        status: 401,
        headers: {
          'Content-Type': 'text/html',
        },
      }
    );
  }

  // for Admin
  if (pathWithoutLocale.startsWith('/admin')) {
    return AdminMiddleware(req);
  }

  // for App
  return AppMiddleware(req);

  // Disable the other middlewares below, we don't use them

  // for API
  // if (API_HOSTNAMES.has(domain)) {
  //   return ApiMiddleware(req);
  // }

  // for public stats pages (e.g. d.to/stats/try)
  // if (path.startsWith("/stats/")) {
  //   return NextResponse.rewrite(new URL(`/${domain}${path}`, req.url));
  // }

  // default redirects for SHORT_DOMAIN
  // if (domain === SHORT_DOMAIN && DEFAULT_REDIRECTS[key]) {
  //   return NextResponse.redirect(DEFAULT_REDIRECTS[key]);
  // }

  // key must be defined for link redirects
  // if (key.length === 0) {
  //   throw Error("Failed to redirect, missing link key");
  // }

  // return LinkMiddleware(req, ev);
}
