import { DEFAULT_LOCALE, LOCALES } from "@dub/utils"
import en from "../../../messages/en.json"
import bm from "../../../messages/bm.json"
import { useParams } from "next/navigation"

export function useIntlClientHook(locale?: string) {
    const params = useParams()
    const dictionaries = {
        "en": en,
        "bm": bm
    }
    if (locale && LOCALES.includes(locale)) return { messages: dictionaries[locale], locale }
    
    // IF NO LOCALE PASS IN AS ARGUMENT, GET LOCALE FROM ROUTER
    const routerLocale = params?.locale as string
    if (routerLocale && LOCALES.includes(routerLocale)) return { messages: dictionaries[routerLocale], locale: routerLocale }

    // IF ALL FAILS, USE DEFAULT LOCALE
    return { messages: dictionaries[DEFAULT_LOCALE], locale: DEFAULT_LOCALE };
}
