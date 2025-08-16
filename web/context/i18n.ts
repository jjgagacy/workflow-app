import { Locale } from "@/i18n";
import { getLanguage } from "@/i18n/config";
import { noop } from "lodash-es";
import { createContext, useContext } from "use-context-selector";

type I18nContextType = {
    locale: Locale;
    i18n: Record<string, any>;
    setClientLocale: (locale: Locale, reloadPage?: boolean) => Promise<void>;
}

const I18nContext = createContext<I18nContextType>({
    locale: 'zh-Hans',
    i18n: {},
    setClientLocale: async (locale: Locale, reloadPage?: boolean): Promise<void> => {
        noop();
    }
});

export const useI18n = () => useContext(I18nContext);

export const useGetLanguage = () => {
    const { locale } = useI18n();

    return getLanguage(locale);
}

export default I18nContext;
