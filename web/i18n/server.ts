import { createInstance } from "i18next";
import { i18n, Locale } from ".";
import { initReactI18next } from "react-i18next/initReactI18next";
import resourcesToBackend from "i18next-resources-to-backend";
import { cookies, headers } from "next/headers";
import Negotiator from 'negotiator';
import { match } from "@formatjs/intl-localematcher";

const initI18next = async (locale: Locale, ns: string) => {
    const obj = createInstance();
    const langMap: Record<string, string> = {
        // 简体中文相关
        'zh-Hans': 'zh-Hans',
        'zh-hans': 'zh-Hans',
        'zh': 'zh-Hans', // 默认简体中文
        'zh-CN': 'zh-Hans',
        'zh-SG': 'zh-Hans',

        // 繁体中文相关
        'zh-TW': 'zh-Hant',
        'zh-HK': 'zh-Hant',
        'zh-MO': 'zh-Hant',
        'zh-Hant': 'zh-Hant',
        'zh-hant': 'zh-Hant',

        // 英语相关 - 主要变体
        'en': 'en-US',          // 默认美国英语
        'en-US': 'en-US',       // 美国英语
        'en-GB': 'en-GB',       // 英国英语
        'en-AU': 'en-AU',       // 澳大利亚英语
        'en-CA': 'en-CA',       // 加拿大英语
        'en-NZ': 'en-NZ',       // 新西兰英语
        'en-IE': 'en-IE',       // 爱尔兰英语
        'en-IN': 'en-IN',       // 印度英语
        'en-ZA': 'en-ZA',       // 南非英语

        // 英语相关 - 其他地区变体
        'en-SG': 'en-SG',       // 新加坡英语
        'en-MY': 'en-MY',       // 马来西亚英语
        'en-PH': 'en-PH',       // 菲律宾英语
        'en-HK': 'en-HK',       // 香港英语
        'en-JM': 'en-JM',       // 牙买加英语
        'en-BZ': 'en-BZ',       // 伯利兹英语
        'en-TT': 'en-TT',       // 特立尼达和多巴哥英语
        'en-ZW': 'en-ZW',       // 津巴布韦英语
        'en-KE': 'en-KE',       // 肯尼亚英语
        'en-NG': 'en-NG',       // 尼日利亚英语

        // 英语相关 - 其他常见代码
        'en-001': 'en-US',      // 世界英语（通常映射到美国英语）
        'en-150': 'en-US',      // 欧洲英语
        'en-Latn': 'en-US',     // 拉丁字母英语
        'en-Latn-US': 'en-US',  // 美国拉丁字母英语

        // 日语相关
        'ja': 'ja-JP',
        'ja-JP': 'ja-JP',
        'ja-Hira': 'ja-JP',
        'ja-Kana': 'ja-JP',

        // 韩语相关
        'ko': 'ko-KR',
        'ko-KR': 'ko-KR',
        'ko-KP': 'ko-KR',       // 北韩韩语通常映射到南韩

        // 法语相关
        'fr': 'fr-FR',
        'fr-FR': 'fr-FR',
        'fr-CA': 'fr-CA',
        'fr-BE': 'fr-BE',
        'fr-CH': 'fr-CH',
        'fr-LU': 'fr-LU',

        // 德语相关
        'de': 'de-DE',
        'de-DE': 'de-DE',
        'de-AT': 'de-AT',
        'de-CH': 'de-CH',
        'de-LI': 'de-LI',
        'de-LU': 'de-LU',

        // 西班牙语相关
        'es': 'es-ES',
        'es-ES': 'es-ES',
        'es-MX': 'es-MX',
        'es-AR': 'es-AR',
        'es-CO': 'es-CO',
        'es-CL': 'es-CL',

        // 其他常见语言
        'pt': 'pt-BR',          // 默认巴西葡萄牙语
        'pt-BR': 'pt-BR',
        'pt-PT': 'pt-PT',

        'ru': 'ru-RU',
        'ru-RU': 'ru-RU',

        'ar': 'ar-SA',
        'ar-SA': 'ar-SA',
        'ar-EG': 'ar-EG',

        'hi': 'hi-IN',
        'hi-IN': 'hi-IN',
    };
    obj.use(initReactI18next)
        .use(resourcesToBackend((lang: string, ns: string) => {
            const mappedLang = langMap[lang] || lang;
            return import(`./languages/${mappedLang}/${ns}.ts`)
        })).on('failedLoading', (lng, ns, msg) =>
            console.error(`Failed to init i18next for language: ${lng}, ns: ${ns}, error: ${msg}`)
        );
    await obj.init({
        lng: locale === 'zh-Hans' ? 'zh-Hans' : locale,
        ns,
        fallbackLng: 'en-US'
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