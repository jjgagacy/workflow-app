import { useAuth } from "@/hooks/use-auth";
import { getClientLocale } from "@/i18n";
import { GraphQLClient } from "graphql-request";

// 基础客户端配置
const client = new GraphQLClient(process.env.NEXT_PUBLIC_PUBLIC_API_PREFIX as string);

// 带认证的客户端
export const getAuthenticatedClient = (token?: string, locale?: string) => {
    const headers: Record<string, string> = {};

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    if (locale) {
        headers['Accept-Language'] = formatAcceptLanguage(locale);
    }

    return new GraphQLClient(process.env.NEXT_PUBLIC_PUBLIC_API_PREFIX as string, {
        headers
    });
}

// 获取当前用户客户端（在组件内使用）
export const useGraphQLClient = () => {
    const { accessToken } = useAuth();
    const locale = getClientLocale();
    return getAuthenticatedClient(accessToken, locale);
}

const formatAcceptLanguage = (locale: string): string => {
    const localeMap: Record<string, string> = {
        'zh-Hans': 'zh-CN,zh;q=0.9,en;q=0.8',
        'zh-CN': 'zh-CN,zh;q=0.9,en;q=0.8',
        'zh-TW': 'zh-TW,zh;q=0.9,en;q=0.8',
        'en-US': 'en-US,en;q=0.9,zh;q=0.8',
        'en-GB': 'en-GB,en;q=0.9,zh;q=0.8',
        'ja-JP': 'ja-JP,ja;q=0.9,en;q=0.8',
        'ko-KR': 'ko-KR,ko;q=0.9,en;q=0.8',
        'fr-FR': 'fr-FR,fr;q=0.9,en;q=0.8',
        'de-DE': 'de-DE,de;q=0.9,en;q=0.8',
        'es-ES': 'es-ES,es;q=0.9,en;q=0.8',
        'ru-RU': 'ru-RU,ru;q=0.9,en;q=0.8',
    };

    if (localeMap[locale]) {
        return localeMap[locale];
    }

    // 通用格式化
    const [language, region] = locale.split('-');
    if (region) {
        return `${locale},${language};q=0.9,en;q=0.8`;
    }

    return `${language},en;q=0.9`;
};
