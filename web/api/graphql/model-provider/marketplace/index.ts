import { useGraphQLQuery } from "@/hooks/use-graphql";
import { GET_MODEL_PROVIDERS } from "./queries";
import { ModelProvider } from "../types/model-provider";

export const useGetModelProviders = (params: {
  excludes?: string[];
  category?: string;
} = {}) => {
  const { data, error, isLoading, mutate } = useGraphQLQuery<{ modelProviders: { data: ModelProvider[]; }; }, typeof params>(
    GET_MODEL_PROVIDERS,
    params,
    {
      shouldRetryOnError: false,
      revalidateOnReconnect: true
    }
  );

  return {
    modelProviders: data?.modelProviders?.data,
    isLoading,
    error,
    mutate
  };
};
