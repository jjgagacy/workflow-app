import api from "@/api";

type CheckInstalledProps = {
  identifiers: string[];
}

export const useCheckPluginInstalled = ({ identifiers }: CheckInstalledProps) => {
  return api.plugin.useListPluginInstallationFromIds({ pluginIds: identifiers });
}