import { DEFAULT_LOCALE, LOCALES } from "@dub/utils";
import { headers } from "next/headers";
import en from "../../../messages/en.json";
import ms from "../../../messages/ms.json";

export function useIntlHook(locale?: string) {
  const dictionaries = {
    en: en,
    ms: ms,
  };

  if (locale && LOCALES.includes(locale))
    return { messages: dictionaries[locale], locale };

  const headersList = headers();
  const locale_header = headersList.get("NEXT_LOCALE");

  if (locale_header && LOCALES.includes(locale_header)) {
    return { messages: dictionaries[locale_header], locale: locale_header };
  }

  // IF ALL FAILS, USE DEFAULT LOCALE
  return { messages: dictionaries[DEFAULT_LOCALE], locale: DEFAULT_LOCALE };
}
