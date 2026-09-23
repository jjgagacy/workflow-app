import { useMarketplacePlugins } from "@/app/components/plugins/marketplace/hooks";
import { useRefreshPlugins } from "@/app/components/plugins/install-plugin/hooks/use-refresh-plugins";
import { useModelProviderContext } from "@/context/model-provider-context";
import { getClientLocale, getLocalizedText } from "@/i18n";
import { getLanguage } from "@/i18n/config";
import { cn } from "@/utils/classnames";
import api from "@/api";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { ModelIcon } from "./model-icon";
import { Button } from "@/app/components/base/button";
import { toast } from "@/app/ui/toast";
import { getErrorMessage } from "@/utils/errors";
import { useGlobalContextStore } from "@/app/components/provider/globalContextProvider";
import { toPluginId } from "../../utils/identifier";

type ModelInstallListProps = {
  marketplaceProviders: string[];
  onInstallPlugin: (plugin: string) => void | Promise<void>;
};

export const ModelInstallList = ({
  marketplaceProviders,
  onInstallPlugin,
}: ModelInstallListProps) => {
  const { t } = useTranslation();
  const locale = getLanguage(getClientLocale());
  const { modelProviderList: providers } = useModelProviderContext();
  const { modelProviders, mutate: refreshMarketplaceList } = useMarketplacePlugins(providers, "");
  const installPluginFromMarketplace = api.plugin.useInstallPluginFromMarketplace();
  const { refreshPlugins } = useRefreshPlugins();
  const [installingKey, setInstallingKey] = useState<string | null>(null);
  const { systemFeatures } = useGlobalContextStore();

  const canInstallModelProviders = useMemo(() => {
    return (modelProviders ?? []).filter((provider) =>
      marketplaceProviders.includes(`${provider.author}/${provider.name}/${provider.provider}`),
    );
  }, [marketplaceProviders, modelProviders]);

  const handleInstall = async (providerKey: string) => {
    setInstallingKey(providerKey);
    try {
      const pluginId = toPluginId(providerKey);
      await installPluginFromMarketplace({ identifiers: [pluginId] });
      refreshPlugins(undefined, true);
      await refreshMarketplaceList();
      await onInstallPlugin(providerKey);
    } catch (error: any) {
      toast.error(getErrorMessage(error));
    } finally {
      setInstallingKey(null);
    }
  };

  if (marketplaceProviders.length === 0 || canInstallModelProviders.length === 0) return null;
  if (!systemFeatures.marketplaceEnabled) return null;

  return (
    <div className="space-y-2 border-t border-[var(--border)] pt-2">
      <div className="px-1.5 py-1 text-[11px] font-medium uppercase tracking-[0.08em] text-muted-foreground">
        {t("system.model_provider.install_model")}
      </div>

      <div className="space-y-1">
        {canInstallModelProviders.map((provider) => {
          const providerKey = `${provider.author}/${provider.name}/${provider.provider}`;
          return (
            <div
              key={providerKey}
              className="group flex items-center gap-3 rounded-md border border-transparent px-2 py-1.5 transition-colors hover:border-[var(--border)] hover:bg-muted/50"
            >
              <div className="flex min-w-0 flex-1 items-center gap-2">
                <ModelIcon small src={provider} alt={provider.name} />
                <span className="truncate text-[13px] font-medium text-foreground/90">
                  {getLocalizedText(provider.label, locale) || provider.name}
                </span>
              </div>

              <div className="flex-1" />

              <Button
                type="button"
                onClick={() => {
                  void handleInstall(providerKey);
                }}
                size={'small'}
                variant={'ghost'}
                loading={installingKey === providerKey}
                disabled={installingKey === providerKey}
                className={cn(
                  "opacity-0 group-hover:opacity-100 group-focus-within:opacity-100",
                )}
              >
                {t("system.model_provider.install_model")}
              </Button>
            </div>
          );
        })}
      </div>
    </div>
  );
};