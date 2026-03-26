import { createMutationHook, useGraphQLQuery } from "@/hooks/use-graphql";
import { ModelProviderInfo } from "../types/model-provider";
import { LIST_MODEL_PROVIDER, PROVIDER_CREDENTIALS } from "../queries";
import { CredentialInput } from "../types";
import { SAVE_CREDENTIALS } from "../mutations";

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

export const useGetProviderCredentials = (params: {
  providerName: string;
}) => {
  const { data, error, isLoading, mutate } = useGraphQLQuery<{ providerCredentials: { credentials: Record<string, any> } }, typeof params>(
    PROVIDER_CREDENTIALS,
    params,
    {
      shouldRetryOnError: false,
      revalidateOnReconnect: true
    }
  );

  return {
    credentials: data?.providerCredentials?.credentials,
    isLoading,
    error,
    mutate
  }
};

export const useSaveCredential = createMutationHook<
  { saveCredentials: boolean },
  { input: CredentialInput },
  boolean
>(
  SAVE_CREDENTIALS,
  {
    transform: (data) => data.saveCredentials
  }
);
