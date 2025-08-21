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

export const useGraphQLMutation = <TData, TVariables extends object = object>(
    mutation: DocumentNode | string
) => {
    const client = useGraphQLClient();

    return async (variables: TVariables): Promise<TData> => {
        try {
            return await client.request<TData>(mutation, variables);
        } catch (error: any) {
            console.error('GraphQL Mutation Error:', error);
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
