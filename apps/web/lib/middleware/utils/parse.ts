import { SHORT_DOMAIN } from "@dub/utils";
import { NextRequest } from "next/server";
import { DEFAULT_LOCALE, LOCALES } from "@dub/utils"

export const parse = (req: NextRequest) => {
  let domain = req.headers.get("host") as string;
  // remove www. from domain and convert to lowercase
  domain = domain.replace("www.", "").toLowerCase();
  if (domain === "dub.localhost:8888" || domain.endsWith(".vercel.app")) {
    // for local development and preview URLs
    domain = SHORT_DOMAIN;
  }

  // path is the path of the URL (e.g. dub.co/stats/github -> /stats/github)
  let path = req.nextUrl.pathname;

  // if path has no locale, add in default locale
  if (path == "/") path = `/${DEFAULT_LOCALE}${path}`

  let locale = decodeURIComponent(path.split("/")[1]);
  const pathWithoutLocale = "/" + path.split("/").slice(2).join("/")

  // if locale is not in list of locales, then set to default locale
  if (!LOCALES.includes(locale)) locale = DEFAULT_LOCALE

  // fullPath is the full URL path (along with search params)
  const searchParams = req.nextUrl.searchParams.toString();
  const fullPath = `${path}${
    searchParams.length > 0 ? `?${searchParams}` : ""
  }`;
  
  const fullPathWithoutLocale = `${pathWithoutLocale}${
    searchParams.length > 0 ? `?${searchParams}` : ""
  }`;

  // Here, we are using decodeURIComponent to handle foreign languages like Hebrew
  const key = decodeURIComponent(path.split("/")[2]); // key is the first part of the path (e.g. dub.co/stats/github -> stats)
  const fullKey = decodeURIComponent(path.slice(1)); // fullKey is the full path without the first slash (to account for multi-level subpaths, e.g. d.to/github/repo -> github/repo)

  return { domain, path, fullPath, key, fullKey, locale, pathWithoutLocale, fullPathWithoutLocale };
};