import { createInstance } from "i18next";
import { i18n, Locale } from ".";
import { initReactI18next } from "react-i18next/initReactI18next";
import resourcesToBackend from "i18next-resources-to-backend";
import { cookies, headers } from "next/headers";
import Negotiator from 'negotiator';
import { match } from "@formatjs/intl-localematcher";

const initI18next = async (locale: Locale, ns: string) => {
    const obj = createInstance();
    await obj
        .use(initReactI18next)
        .use(resourcesToBackend((lang: string, ns: string) => import(`./languages/${lang}/${ns}.ts`)))
        .init({
            lng: locale === 'zh-Hans' ? 'zh-Hans' : locale,
            ns,
            fallbackLng: 'zh-Hans'
        });
    return obj;
}

export async function useTranslation(locale: Locale, ns = '', options: Record<string, any> = {}) {
    const i18n = await initI18next(locale, ns);
    return {
        t: i18n.getFixedT(locale, ns, options.keyPrefix),
        i18n
    };
}

export const getServerLocale = async (): Promise<Locale> => {
    const locales: string[] = i18n.locales;
    let languages: string[] | undefined;
    // get locale from cookie
    const cookieVal = (await cookies()).get('locale');
    languages = cookieVal?.value ? [cookieVal.value] : [];

    if (!languages.length) {
        const negotiatorHeaders: Record<string, string> = {};
        (await headers()).forEach((value, key) => (negotiatorHeaders[key] = value));
        // get best locale from Negotiator
        languages = new Negotiator({ headers: negotiatorHeaders }).languages();
    }

    // validate language
    if (!Array.isArray(languages) || languages.length === 0 || !languages.every(lang => typeof lang === 'string' && /^[\w-]+$/.test(lang))) {
        languages = [i18n.defaultLocale];
    }

    return match(languages, locales, i18n.defaultLocale) as Locale;
}