import { useGraphQLQuery } from "@/hooks/use-graphql";
import { ModelProviderInfo } from "../types/model-provider";
import { LIST_MODEL_PROVIDER } from "../queries";

export const useGetModelProviderList = (params: {
  modelType?: string;
} = {}) => {
  const { data, error, isLoading, mutate } = useGraphQLQuery<{ modelProviderList: { data: ModelProviderInfo[] } }, typeof params>(
    LIST_MODEL_PROVIDER,
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
