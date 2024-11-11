import { DEFAULT_LOCALE } from '@dub/utils';
import { isSupportedLocale } from '@dub/utils/src/functions/isSupportedLocale';
import { headers } from 'next/headers';
import en from '../../../messages/en.json';
import ms from '../../../messages/ms.json';

export function useIntlHook(locale?: string) {
  const dictionaries = {
    'en-GB': en,
    'ms-MY': ms,
  };

  if (locale && isSupportedLocale(locale)) return { messages: dictionaries[locale], locale };

  const headersList = headers();
  const locale_header = headersList.get('NEXT_LOCALE');

  if (locale_header && isSupportedLocale(locale_header)) {
    return { messages: dictionaries[locale_header], locale: locale_header };
  }

  // IF ALL FAILS, USE DEFAULT LOCALE
  return { messages: dictionaries[DEFAULT_LOCALE], locale: DEFAULT_LOCALE };
}

export function nonHooki18nFunc(locale?: string) {
  const dictionaries = {
    'en-GB': en,
    'ms-MY': ms,
  };

  if (locale && isSupportedLocale(locale)) return { messages: dictionaries[locale], locale };

  const headersList = headers();
  const locale_header = headersList.get('NEXT_LOCALE');

  if (locale_header && isSupportedLocale(locale_header)) {
    return { messages: dictionaries[locale_header], locale: locale_header };
  }

  // IF ALL FAILS, USE DEFAULT LOCALE
  return { messages: dictionaries[DEFAULT_LOCALE], locale: DEFAULT_LOCALE };
}
