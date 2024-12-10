import { LocalePrefix } from 'next-intl/routing';

export type Locale = 'en-GB' | 'ms-MY';
export const defaultLocale = 'en-GB';
export const locales = [defaultLocale, 'ms-MY'];
// localePrefix removed since you're using query parameters
