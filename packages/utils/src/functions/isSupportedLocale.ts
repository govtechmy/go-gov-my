import { LOCALES, Locale } from '../constants';

export function isSupportedLocale(str: string): str is Locale {
  return LOCALES.includes(str);
}
