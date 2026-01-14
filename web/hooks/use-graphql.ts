'use client';

import { useGraphQLClient } from '@/api/graphql'
import { DocumentNode } from 'graphql'
import { useMemo } from 'react';
import useSWR from 'swr';

export const useGraphQLQuery = <
  TData,
  TVariables extends object = object
>(
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

export function createQueryHook<
  TData,
  TVariables extends object = object,
  TTransformed = TData
>(
  queries: DocumentNode | string,
  config?: {
    transform?: (data: TData) => TTransformed,
    defaultVariables?: Partial<TVariables>,
    hookOptions?: {
      onSuccess?: (data: TTransformed) => void;
      onError?: (error: any) => void;
    },
    queryOptions?: {
      shouldRetryOnError?: boolean;
      revalidateOnReconnect?: boolean;
      staleTime?: number;
      cacheTime?: number;
      refetchOnWindowFocus?: boolean;
    }
  }
) {
  const {
    transform,
    defaultVariables = {},
    hookOptions = {},
    queryOptions = {},
  } = config || {};
  return () => {
    const enhancedQuery = (
      variables?: TVariables,
      options?: any,
    ): { data: TTransformed, mutate: any, isLoading: boolean, error: any } => {
      const mergedVariables = useMemo(() => {
        return { ...defaultVariables, ...variables } as TVariables;
      }, [defaultVariables, variables]);

      const mergedQueryOptions = useMemo(() => {
        return { ...queryOptions, ...options };
      }, [queryOptions, options]);

      try {
        const { data, error, isLoading, mutate } = useGraphQLQuery<TData, TVariables>(
          queries,
          mergedVariables,
          mergedQueryOptions,
        );
        if (error) {
          throw error;
        }
        const transformedData = transform ? transform(data!) : (data as unknown as TTransformed);
        hookOptions?.onSuccess?.(transformedData);
        options?.onSuccess?.(transformedData);
        return {
          data: transformedData,
          mutate,
          isLoading,
          error
        };
      } catch (error) {
        options?.onError?.(error);
        config?.hookOptions?.onError?.(error);
        throw error;
      }
    }
    return enhancedQuery;
  };
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
