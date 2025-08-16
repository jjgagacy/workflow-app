import { useAuth } from "@/hooks/use-auth";
import { GraphQLClient } from "graphql-request";


// 基础客户端配置
const client = new GraphQLClient(process.env.NEXT_PUBLIC_PUBLIC_API_PREFIX as string);

// 带认证的客户端
export const getAuthenticatedClient = (token?: string) => {
    const headers: Record<string, string> = {};

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    return new GraphQLClient(process.env.NEXT_PUBLIC_PUBLIC_API_PREFIX as string, {
        headers
    });
}

// 获取当前用户客户端（在组件内使用）
export const useGraphQLClient = () => {
    const { accessToken } = useAuth();
    return getAuthenticatedClient(accessToken);
}
