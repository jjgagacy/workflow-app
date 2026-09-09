import { useSWRConfig } from "swr";
import { GET_PLUGIN_INSTALLATIONS } from "@/api/graphql/plugin/queries";
import { LIST_MODEL_PROVIDER } from "@/api/graphql/model-provider/queries";
import { Plugin } from "../../types"
import { useModelProviderContext } from "@/context/model-provider-context";

export const useRefreshPlugins = () => {
  const { mutate } = useSWRConfig();
  // const { mutateModelProviderList } = useModelProviderContext();

  return {
    refreshPlugins: (plugin?: Plugin | null, refreshAll?: boolean) => {
      // revalidate the installed-check cache for this plugin
      mutate((key: any) => Array.isArray(key) && key[0] === GET_PLUGIN_INSTALLATIONS);

      // installing a model plugin can change the model provider list, revalidate it too
      if (plugin?.providerType === 'model' || refreshAll) {
        mutate((key: any) => Array.isArray(key) && key[0] === LIST_MODEL_PROVIDER);
      }
    }
  }
}