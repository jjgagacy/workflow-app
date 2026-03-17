import Cookies from "js-cookie";
import { changeLanguage, LanguagesSupported } from "./config";
import { LOCALE_COOKIE_NAME } from "@/config";

export const i18n = {
  defaultLocale: 'en-US',
  locales: LanguagesSupported
} as const;

export type Locale = typeof i18n['locales'][number];

export const setClientLocale = async (locale: Locale, reloadPage = true) => {
  Cookies.set(LOCALE_COOKIE_NAME, locale, { expires: 365 });
  await changeLanguage(locale);
  reloadPage && location.reload();
}

export const getClientLocale = (): Locale => {
  return Cookies.get(LOCALE_COOKIE_NAME) as Locale || i18n.defaultLocale;
}

export const getLocalizedText = (obj: Record<string, string>, locale: string) => {
  if (!obj) return '';
  return obj[locale] || obj[i18n.defaultLocale.replace('-', '_')] || Object.values(obj)[0] || '';
}
