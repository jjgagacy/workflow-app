import { camelCase } from 'lodash-es';
import data from './languages.json';
import i18next from 'i18next';
import { initReactI18next } from 'react-i18next/initReactI18next';

export type LanguageType = {
    value: number | string;
    name: string;
    example: string;
}

export type I18nText = {
    'en-US': string;
    'zh-Hans': string;
}

const NAMESPACE = ['app','login'] as const;

type NameSpace = typeof NAMESPACE[number];
type Translations = Record<string, any>;

export const languages = data.languages;

export const LanguagesSupported = languages.filter(item => item.supported).map(item => item.value);

export const getLanguage = (locale: string) => {
    if (['zh-Hans'].includes(locale))
        return locale.replace('-', '_');
    return LanguagesSupported[0].replace('-', '_');
}

const requireLanguage = async (language: string, namespace: string) => {
    try {
        // Attempt to load the requested language first
        const module = await import(`../i18n/languages/${language}/${namespace}`);
        return module.default;
    } catch (error) {
        // Fallback to English if the requested language fails
        try {
            const fallbackModule = await import(`../i18n/languages/zh-Hans/${namespace}`);
            return fallbackModule.default;
        } catch (fallbackError) {
            // If both fail, return an empty object to prevent crashes
            console.error(`Failed to load i18n namespace "${namespace}" for both ${language} and zh-HANS`);
            return {};
        }
    }
}

export const loadLanguageResources = async (language: string) => {
    const modules = await Promise.all(NAMESPACE.map(ns => requireLanguage(language, ns)));
    const resources = modules.reduce((acc, mod, index) => {
        acc[camelCase(NAMESPACE[index])] = mod;
        return acc;
    }, {} as Record<string, any>);
    return resources;
}

export const changeLanguage = async (language?: string) => {
    if (!language) return;
    const resources = await loadLanguageResources(language);
    if (!i18next.hasResourceBundle(language, 'common')) {
        i18next.addResourceBundle(language, 'common', resources, true, true);
    }
    await i18next.loadLanguages(language);
}

const getInitialTranslations = () => {
    // Helper function to load resources for a specific language
    const load = (language: string): Translations => {
        return NAMESPACE.reduce((acc, ns) => {
            const moduleName = camelCase(ns);
            try {
                acc[moduleName] = require(`../i18n/languages/${language}/${ns}`).deault;
            } catch (error) {
                console.error(`Failed to load ${language} translations for namespace ${ns}:`, error);
                acc[moduleName] = {};  // Fallback to empty object if loading fails
            }
            return acc;
        }, {} as Record<string, any>);
    }

    return {
        'en-US': { translation: load('en-US') },
        'zh-Hans': { translation: load('zh-Hans') },
    }
}

if (!i18next.isInitialized) {
    i18next
        .use(initReactI18next)
        .init({
            lng: undefined,
            fallbackLng: 'zh-Hans',
            resources: getInitialTranslations(),
            ns: ['common'],
            defaultNS: 'common'
        });
}

export default i18next;