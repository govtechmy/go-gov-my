import { headers } from 'next/headers'
import { DEFAULT_LOCALE } from "@dub/utils"
import en from "../../../messages/en.json"
import bm from "../../../messages/bm.json"

export function useIntlHook(locale?: string) {
    const dictionaries = {
        "en": en,
        "bm": bm
    }
    if (locale) return dictionaries[locale] 

    const headersList = headers()
    const locale_header = headersList.get('NEXT_LOCALE')
    console.log("useIntlHook", locale_header)

    if (locale_header) return dictionaries[locale_header]

    return dictionaries[DEFAULT_LOCALE];
}
