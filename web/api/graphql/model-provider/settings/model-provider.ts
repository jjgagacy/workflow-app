import { GET_MODEL_PROVIDERS } from "../queries";
import { useGraphQLQuery } from "@/hooks/use-graphql";
import { ModelProviderInfo } from "../types/model-provider";

export const useGetModelProviderList = (params: {
  modelType?: string;
} = {}) => {
  const { data, error, isLoading, mutate } = useGraphQLQuery<{ modelProviderList: { data: ModelProviderInfo[] } }, typeof params>(
    GET_MODEL_PROVIDERS,
    params,
    {
      shouldRetryOnError: false,
      revalidateOnReconnect: true
    }
  );

  return {
    modelProviders: data?.modelProviderList?.data,
    isLoading,
    error,
    mutate
  }
}
