import { DEFAULT_LOCALE, LOCALES } from "@dub/utils";
import { useParams } from "next/navigation";
import en from "../../../messages/en.json";
import ms from "../../../messages/ms.json";

export function useIntlClientHook(locale?: string) {
  const params = useParams();
  const dictionaries = {
    en: en,
    ms: ms,
  };
  if (locale && LOCALES.includes(locale))
    return { messages: dictionaries[locale], locale };

  // IF NO LOCALE PASS IN AS ARGUMENT, GET LOCALE FROM ROUTER
  const routerLocale = params?.locale as string;
  if (routerLocale && LOCALES.includes(routerLocale))
    return { messages: dictionaries[routerLocale], locale: routerLocale };

  // IF ALL FAILS, USE DEFAULT LOCALE
  return { messages: dictionaries[DEFAULT_LOCALE], locale: DEFAULT_LOCALE };
}
