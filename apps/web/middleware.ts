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
    const basicAuth = req.headers.get('authorization');
    if (basicAuth) {
      const authValue = basicAuth.split(' ')[1];
      const [user, password] = atob(authValue).split(':');

      if (user === 'admin' && password === process.env.STAGING_AUTH_PASSWORD) {
        const response = NextResponse.next({
          request: { headers: req.headers },
        });
        response.headers.set('Authorization', basicAuth);
        // return response;
      } else {
        return new NextResponse('Auth required', {
          status: 401,
          headers: { 'WWW-Authenticate': `Basic realm="Secure Area"` },
        });
      }
    } else {
      return new NextResponse('Auth required', {
        status: 401,
        headers: { 'WWW-Authenticate': `Basic realm="Secure Area"` },
      });
    }
  }

  // for Admin
  if (pathWithoutLocale.startsWith('/admin')) {
    return AdminMiddleware(req);
  }

  // for App
  return AppMiddleware(req);
}
