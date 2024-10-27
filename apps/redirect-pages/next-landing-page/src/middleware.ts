import createIntlMiddleware from 'next-intl/middleware';
import { NextResponse, type NextRequest } from 'next/server';
import { defaultLocale, locales } from './i18n-config';

const intlMiddleware = createIntlMiddleware({
  locales,
  defaultLocale,
  localeDetection: false
});

export function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;
  const locale = searchParams.get("locale") || defaultLocale;

  if (!locales.includes(locale as any)) {
    return NextResponse.redirect(new URL(`${pathname}?locale=${defaultLocale}`, request.url));
  }

  const response = intlMiddleware(request);
  response.headers.set("x-locale", locale);
  response.cookies.set("NEXT_LOCALE", locale, { path: "/" });

  return response;
}

export const config = {
  matcher: ['/((?!api|_next|.*\\..*).*)']
};
