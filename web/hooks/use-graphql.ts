'use client';

import { useGraphQLClient } from '@/api/graphql'
import { DocumentNode } from 'graphql'
import useSWR from 'swr';

export const useGraphQLQuery = <TData, TVariables extends object = object>(
    query: DocumentNode | string,
    variables?: TVariables,
    options?: any
) => {
    const client = useGraphQLClient();

    const fetcher = () => client.request<TData>(query, variables);

    return useSWR<TData>(
        [query, variables],
        fetcher,
        {
            revalidateOnFocus: false,
            ...options
        }
    );
}

export const useGraphQLMutation = <
    TData,
    TVariables extends object = object
>(
    mutation: DocumentNode | string
) => {
    const client = useGraphQLClient();

    return async (variables: TVariables): Promise<TData> => {
        try {
            return await client.request<TData>(mutation, variables);
        } catch (error: any) {
            // 捕获 GraphQL 错误并转换为 JSON 格式
            const errorData = error.response?.errors?.[0] || {
                message: error?.message,
                extensions: {
                    statusCode: 500
                }
            };
            throw new Error(JSON.stringify(errorData));
        }
    }
}

export function createMutationHook<
    TData,
    TVariables extends object,
    TTransformed = TData
>(
    mutation: DocumentNode | string,
    config?: {
        // 数据转换函数
        transform?: (data: TData) => TTransformed;
        // 默认变量（可选）
        defaultVariables?: Partial<TVariables>;
        // 钩子选项
        hookOptions?: {
            onSuccess?: (data: TTransformed) => void;
            onError?: (error: any) => void;
        };
    }
) {
    return () => {
        const mutate = useGraphQLMutation<TData, TVariables>(mutation);
        const enhancedMutate = async (
            variables: TVariables,
            options?: {
                onSuccess?: (data: TTransformed) => void;
                onError?: (error: any) => void;
            }
        ): Promise<TTransformed> => {
            try {
                console.log(variables)
                const data = await mutate({
                    ...config?.defaultVariables,
                    ...variables,
                } as TVariables);

                const transformed = config?.transform?.(data) ?? (data as unknown as TTransformed);
                // 触发回调
                options?.onSuccess?.(transformed);
                config?.hookOptions?.onSuccess?.(transformed);

                return transformed;
            } catch (error) {
                options?.onError?.(error);
                config?.hookOptions?.onError?.(error);
                throw error;
            }
        };

        return enhancedMutate;
    };
}
