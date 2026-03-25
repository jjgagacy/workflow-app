import { useGetProviderCredentials } from "@/api/graphql/model-provider/settings/model-provider"
import { FormValue } from "@/api/graphql/model-provider/types/model-provider";

type CredentialResponse = {
  credentials: Record<string, any>;
  mutate: () => void;
}

export const useProviderCredentials = (
  provider: string,
): CredentialResponse => {
  const { credentials: providerCredentials, mutate } = useGetProviderCredentials({ providerName: provider });
  return {
    credentials: providerCredentials || {},
    mutate
  };
}

export const saveCredentials = async (predefined: boolean, providerName: string, formValue: FormValue) => {
  // todo: call api to save credentials
}