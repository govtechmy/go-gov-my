import { createSharedPathnamesNavigation } from "next-intl/navigation";
import { getRequestConfig } from "next-intl/server";
import { notFound } from "next/navigation";
import { locales, defaultLocale } from "../i18n-config";
import { AbstractIntlMessages } from "next-intl";
import { NextRequest } from "next/server";

export const { Link, redirect, usePathname, useRouter } =
  createSharedPathnamesNavigation({ locales });

export default getRequestConfig(async ({ locale }) => {
  // Validate that the incoming `locale` parameter is valid
  if (!locales.includes(locale as any)) notFound();

  return {
    messages: (await import(`../../messages/${locale}.json`)).default,
    locales,
    defaultLocale
  };
});

export function extract(messages: AbstractIntlMessages, path: string): string {
  const keys = path.split(".");

  let current = messages;

  for (const key of keys) {
    const value = current[key];

    if (typeof value === "string") {
      return value;
    }

    current = value;
  }

  return "";
}

export function keypath(...args: string[]): string {
  return args.join(".");
}

export function getLocaleFromURL(url: URL): string {
  const locale = url.searchParams.get('locale');
  return locale && locales.includes(locale as any) ? locale : defaultLocale;
}

export function getLocale(request: NextRequest): string {
  const locale = request.nextUrl.searchParams.get("locale") || request.cookies.get("NEXT_LOCALE")?.value;
  return locale && locales.includes(locale as any) ? locale : defaultLocale;
}
