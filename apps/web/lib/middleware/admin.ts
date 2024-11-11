import { parse } from '@/lib/middleware/utils';
import { getToken } from 'next-auth/jwt';
import { NextRequest, NextResponse } from 'next/server';
import { type Session } from '../auth';
import { SESSION_TOKEN_NAME } from '../auth/constants';
import { isInternalAdmin } from '../auth/is-internal-admin';

export default async function AdminMiddleware(req: NextRequest): Promise<NextResponse> {
  const { pathWithoutLocale, locale } = parse(req);
  if (!pathWithoutLocale.startsWith('/admin')) {
    throw Error('invalid request, expected path to start with /admin');
  }

  const session = (await getToken({ req })) as unknown as Session | null;
  const isAdmin = !!session && isInternalAdmin(session);

  // Redirect to login page if not logged-in/not an admin
  if (!isAdmin) {
    if (pathWithoutLocale === '/login') {
      return NextResponse.next();
    }
    const response = NextResponse.redirect(new URL(`/${locale}/login`, req.url));
    // Sign-out the user by deleting the session cookie
    response.cookies.delete(SESSION_TOKEN_NAME);
    return response;
  }

  return NextResponse.rewrite(new URL(`/${locale}${pathWithoutLocale}`, req.url));
}
