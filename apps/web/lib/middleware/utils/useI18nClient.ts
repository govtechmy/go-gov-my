import { DEFAULT_LOCALE } from '@dub/utils';
import { isSupportedLocale } from '@dub/utils/src/functions/isSupportedLocale';
import { useParams } from 'next/navigation';
import en from '../../../messages/en.json';
import ms from '../../../messages/ms.json';

export function useIntlClientHook(locale?: string) {
  const params = useParams();
  const dictionaries = {
    'en-GB': en,
    'ms-MY': ms,
  };
  if (locale && isSupportedLocale(locale)) return { messages: dictionaries[locale], locale };

  // IF NO LOCALE PASS IN AS ARGUMENT, GET LOCALE FROM ROUTER
  const routerLocale = params?.locale as string;
  if (routerLocale && isSupportedLocale(routerLocale))
    return { messages: dictionaries[routerLocale], locale: routerLocale };

  // IF ALL FAILS, USE DEFAULT LOCALE
  return { messages: dictionaries[DEFAULT_LOCALE], locale: DEFAULT_LOCALE };
}
