import { headers } from 'next/headers'
import { DEFAULT_LOCALE, LOCALES } from "@dub/utils"
import en from "../../../messages/en.json"
import bm from "../../../messages/bm.json"

export function useIntlHook(locale?: string) {
    const dictionaries = {
        "en": en,
        "bm": bm
    }
    if (locale && LOCALES.includes(locale)) return { messages: dictionaries[locale], locale }

    const headersList = headers()
    const locale_header = headersList.get('NEXT_LOCALE')
    if (locale_header && LOCALES.includes(locale_header)) {
        return { messages: dictionaries[locale_header], locale: locale_header }
    }
    
    // IF ALL FAILS, USE DEFAULT LOCALE
    return { messages: dictionaries[DEFAULT_LOCALE], locale: DEFAULT_LOCALE };
}
