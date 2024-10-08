import { AppMiddleware } from '@/lib/middleware';
import { parse } from '@/lib/middleware/utils';
import { NextFetchEvent, NextRequest } from 'next/server';
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
