import { useCheckPluginInstalled } from '@/services/use-plugins';
import { useCallback, useMemo } from 'react';
import { PluginSimple } from '../types';
type CheckInstalledProps = {
  identifiers: string[];
}

export const useCheckInstalled = (props: CheckInstalledProps) => {
  const { pluginInstallations: data, isLoading, mutate } = useCheckPluginInstalled({ identifiers: props.identifiers });

  const installInfo = useMemo(() => {
    if (!data) return null;
    const res: Record<string, PluginSimple> = {};
    data.forEach((item) => {
      res[item.pluginId] = {
        id: item.id,
        pluginId: item.pluginId,
        version: item.version
      }
    });

    return res;
  }, [data]);

  return {
    installInfo,
    isLoading,
    mutate
  }
}