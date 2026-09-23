import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { useTranslation } from "react-i18next";
import { EmptyData } from "@/app/components/base/empty-data";
import { Input } from "@/app/ui/input";
import { getClientLocale, getLocalizedText } from "@/i18n";
import { getLanguage } from "@/i18n/config";
import type { ModelProviderModels, SelectModel } from "@/types/model";
import { useModelProviderContext } from "@/context/model-provider-context";
import { useGlobalContextStore } from "@/app/components/provider/globalContextProvider";
import { ModelPopItem } from "./model-popItem";
import { ModelInstallList } from "./model-installList";

type ModelPopListProps = {
  modelList: ModelProviderModels[];
  selectedModel?: SelectModel;
  onSelect: (model: SelectModel) => void;
  hiddenSearch?: boolean;
  searchText?: string;
  wrapperWidth?: number;
};

export const ModelPopList = ({
  modelList,
  selectedModel,
  onSelect,
  hiddenSearch,
  searchText,
  wrapperWidth,
}: ModelPopListProps) => {
  const { t } = useTranslation();
  const [internalSearchValue, setInternalSearchValue] = useState("");
  const locale = getLanguage(getClientLocale());
  const searchValue = searchText ?? internalSearchValue;
  const { modelProviderList: installedProviderList } = useModelProviderContext();
  const { systemFeatures } = useGlobalContextStore();

  const filteredProviders = useMemo(() => {
    const normalizedQuery = searchValue.trim().toLowerCase();

    return modelList
      .map((provider) => {
        const visibleModels = !normalizedQuery
          ? provider.models
          : provider.models.filter((model) => {
            const label = getLocalizedText(model.label, locale) || model.model;
            return (
              provider.providerName.toLowerCase().includes(normalizedQuery) ||
              provider.providerName.toLowerCase().includes(normalizedQuery) ||
              label.toLowerCase().includes(normalizedQuery) ||
              model.model.toLowerCase().includes(normalizedQuery)
            );
          });

        return {
          ...provider,
          visibleModels,
        };
      })
      .filter((provider) => provider.visibleModels.length > 0);
  }, [locale, modelList, searchValue]);

  console.log('==', modelList)

  const marketplaceProviders = useMemo(() => {
    const marketplaceProviders = systemFeatures.defaultModelProviderSelectorList.split(',');
    return marketplaceProviders.filter(provider => !installedProviderList.some(installed => installed.providerName === provider));
  }, [installedProviderList, systemFeatures]);

  return (
    <div
      className="space-y-2 rounded-md border border-[var(--border)] bg-popover p-1.5 shadow-lg"
      style={{ width: wrapperWidth || 280 }}
    >
      {!modelList || modelList.length === 0 ? (
        <EmptyData
          title={t("workflow.common.noResults")}
        />
      ) : (
        <>
          {!hiddenSearch && (
            <div className="relative">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={searchValue}
                onChange={(event) => {
                  if (searchText === undefined) {
                    setInternalSearchValue(event.target.value);
                  }
                }}
                placeholder={t("workflow.nodes.llm.selectModel")}
                className="py-1.5 pl-8 pr-2 text-[13px]"
              />
            </div>
          )}

          <div className="max-h-[360px] space-y-3 overflow-y-auto pr-1">
            {filteredProviders.length === 0 ? (
              <div className="rounded-md border border-dashed border-[var(--border)] bg-background px-3 py-4 text-center text-xs text-muted-foreground">
                {t("workflow.common.noResults")}
              </div>
            ) : (
              filteredProviders.map((provider) => (
                <ModelPopItem
                  key={provider.providerName}
                  provider={provider}
                  selectedModel={selectedModel}
                  onSelect={onSelect}
                />
              ))
            )}
          </div>

          <ModelInstallList
            marketplaceProviders={marketplaceProviders}
            onInstallPlugin={(plugin: string) => { }}
          />
        </>
      )}
    </div>
  );
};
