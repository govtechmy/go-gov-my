import { NextRequest, NextResponse } from "next/server";
import { defaultLocale, locales } from "./i18n-config";

export function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;
  const locale = searchParams.get("locale") || defaultLocale;

  if (!locales.includes(locale as any)) {
    return NextResponse.redirect(new URL(`${pathname}?locale=${defaultLocale}`, request.url));
  }

  // Instead of rewriting the URL, we'll just pass it through
  const response = NextResponse.next();
  response.headers.set("x-locale", locale);

  // Set a cookie with the current locale
  response.cookies.set("NEXT_LOCALE", locale, { path: "/" });

  return response;
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};