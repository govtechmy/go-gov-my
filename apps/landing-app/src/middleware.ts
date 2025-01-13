import { NextRequest, NextResponse } from "next/server";
import { defaultLocale, locales } from "./i18n-config";

export async function middleware(request: NextRequest) {
  // Staging auth
  if (process.env.NEXT_PUBLIC_APP_ENV === 'staging') {
    const basicAuth = request.headers.get('authorization');
    if (basicAuth) {
      const authValue = basicAuth.split(' ')[1];
      const [user, password] = atob(authValue).split(':');
      if (user === 'admin' && password === process.env.STAGING_AUTH_PASSWORD) {
        return handleLocaleRedirect(request);
      }
    }

    return new NextResponse('Auth required', {
      status: 401,
      headers: { 'WWW-Authenticate': `Basic realm="Secure Area"` },
    });
  }

  // Development and Production - proceed with locale handling
  return handleLocaleRedirect(request);
}

// Helper function to handle query parameter based locale
function handleLocaleRedirect(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;
  const locale = searchParams.get("locale") || defaultLocale;

  if (!locales.includes(locale as any)) {
    return NextResponse.redirect(new URL(`${pathname}?locale=${defaultLocale}`, request.url));
  }

  const response = NextResponse.next();
  response.headers.set("x-locale", locale);
  response.cookies.set("NEXT_LOCALE", locale, { path: "/" });

  return response;
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};