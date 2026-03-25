import { useGraphQLQuery } from "@/hooks/use-graphql";
import { MODEL_CREDENTIALS } from "../queries";

export const useGetModelCredentials = (params: {
  providerName: string;
  model: string;
  modelType: string;
}) => {
  const { data, error, isLoading, mutate } = useGraphQLQuery<{ modelCredentials: { credentials: Record<string, any> } }, typeof params>(
    MODEL_CREDENTIALS,
    params,
    {
      shouldRetryOnError: false,
      revalidateOnReconnect: true
    }
  );

  return {
    credentials: data?.modelCredentials?.credentials,
    isLoading,
    error,
    mutate
  }
};