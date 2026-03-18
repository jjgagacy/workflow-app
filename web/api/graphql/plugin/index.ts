import { useGraphQLMutation, useGraphQLQuery } from "@/hooks/use-graphql";
import { INSTALL_PLUGIN_FROM_MARKETPLACE } from "./mutations/plugin-mutation";
import { GET_PLUGIN_INSTALLATIONS } from "./queries";
import { PluginInstallation } from "@/app/components/plugins/types";

export const useInstallPluginFromMarketplace = () => {
  const mutation =
    useGraphQLMutation<
      { installFromMarketplace: { allInstalled: boolean } }, { identifiers: string[] }
    >(INSTALL_PLUGIN_FROM_MARKETPLACE);

  return async (params: { identifiers: string[] }) => {
    const response = await mutation({ identifiers: params.identifiers });
    return response.installFromMarketplace;
  };
}

export const useListPluginInstallationFromIds = (params: {
  pluginIds: string[];
}) => {
  const { data, error, isLoading, mutate } = useGraphQLQuery<{ listPluginFromIds: PluginInstallation[] }, typeof params>(
    GET_PLUGIN_INSTALLATIONS,
    params,
    {
      shouldRetryOnError: false,
      revalidateOnReconnect: true
    }
  );

  return {
    pluginInstallations: data?.listPluginFromIds,
    isLoading,
    error,
    mutate
  };
}