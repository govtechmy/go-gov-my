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

  if (process.env.NEXT_PUBLIC_APP_ENV === 'staging') {
    // Check for password authentication
    const authPassword = process.env.STAGING_AUTH_PASSWORD;
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
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
              display: flex;
              justify-content: center;
              align-items: center;
              height: 100vh;
              margin: 0;
              background-color: #f5f5f5;
            }
            form {
              background: white;
              padding: 2rem;
              border-radius: 8px;
              box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
              text-align: center;
            }
            input {
              display: block;
              width: 100%;
              padding: 0.75rem;
              margin: 1rem 0;
              border: 1px solid #ddd;
              border-radius: 4px;
              font-size: 1rem;
            }
            button {
              background: #0070f3;
              color: white;
              border: none;
              padding: 0.75rem 1.5rem;
              border-radius: 4px;
              font-size: 1rem;
              cursor: pointer;
              transition: background 0.2s ease;
            }
            button:hover {
              background: #0051cc;
            }
          </style>
        </head>
        <body>
          <form method="get">
            <h1>Staging Access</h1>
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
  }
  // for Admin
  if (pathWithoutLocale.startsWith('/admin')) {
    return AdminMiddleware(req);
  }

  // for App
  return AppMiddleware(req);
}
