import { createMutationHook, useGraphQLMutation, useGraphQLQuery } from "@/hooks/use-graphql";
import { CHECK_PLUGIN_INSTALLATION_TASK, INSTALL_PLUGIN_FROM_MARKETPLACE, UNINSTALL_PLUGIN_FROM_MARKETPLACE } from "./mutations/plugin-mutation";
import { GET_PLUGIN_INSTALLATIONS } from "./queries";
import { PluginInstallation } from "@/app/components/plugins/types";
import { TaskInstalltions } from "./types";

export const useInstallPluginFromMarketplace = () => {
  const mutation = useGraphQLMutation<
    { installFromMarketplace: { allInstalled: boolean, taskId: string } },
    { identifiers: string[] }
  >(INSTALL_PLUGIN_FROM_MARKETPLACE);

  return async (params: { identifiers: string[] }) => {
    const response = await mutation({ identifiers: params.identifiers });
    return response.installFromMarketplace;
  };
}

export const useUninstallPluginFromMarketplace = () => {
  const mutation =
    useGraphQLMutation<
      { uninstallFromMarketplace: { success: boolean } },
      { identifiers: string[] }
    >(UNINSTALL_PLUGIN_FROM_MARKETPLACE);

  return async (params: { identifiers: string[] }) => {
    const response = await mutation({ identifiers: params.identifiers });
    return response.uninstallFromMarketplace;
  };
}

export const useCheckPluginInstallationTask = createMutationHook<
  {
    checkPluginInstallationTask: {
      success: boolean;
      taskInstallations: TaskInstalltions | null;
    };
  },
  {
    taskId?: string | null;
  },
  {
    success: boolean;
    taskInstallations: TaskInstalltions | null;
  }
>(
  CHECK_PLUGIN_INSTALLATION_TASK,
  {
    transform: (data) => data.checkPluginInstallationTask,
  }
);

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