import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { useTranslation } from "react-i18next";
import { EmptyData } from "@/app/components/base/empty-data";
import { Input } from "@/app/ui/input";
import { getClientLocale, getLocalizedText } from "@/i18n";
import { getLanguage } from "@/i18n/config";
import { cn } from "@/utils/classnames";
import type { ModelProviderModels, SelectModel } from "@/types/model";
import { useCustomTheme } from "@/app/components/provider/customThemeProvider";
import { ModelIcon } from "./model-icon";

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

  return (
    <div
      className="space-y-2 rounded-md border border-[var(--border)] bg-popover p-1.5 shadow-lg"
      style={{ width: wrapperWidth || 280 }}
    >
      {!modelList || modelList.length === 0 ? (
        <EmptyData
          title={t("workflow.common.noResults")}
          description={<div className="text-text-secondary">{t("workflow.common.noResults")}</div>}
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
                <div key={provider.providerName} className="space-y-1.5">
                  <div className="flex items-center gap-2 px-1.5 py-1 text-[11px] font-medium uppercase tracking-[0.08em] text-muted-foreground">
                    <ModelIcon
                      small
                      src={provider}
                      alt={provider.providerName}
                    />
                    <span>{getLocalizedText(provider.label, locale) || provider.providerName}</span>
                  </div>

                  <div className="space-y-1">
                    {provider.visibleModels.map((model) => {
                      const isSelected =
                        selectedModel?.provider === provider.providerName && selectedModel?.model === model.model;

                      return (
                        <button
                          key={`${provider.providerName}-${model.model}`}
                          type="button"
                          onClick={() => onSelect({ provider: provider.providerName, model: model.model })}
                          className={cn(
                            "flex w-full items-center justify-between gap-2 rounded-md border px-2 py-1.5 text-left transition-colors",
                            isSelected
                              ? "border-[var(--border)] bg-primary/5"
                              : "border-transparent hover:border-[var(--border)] hover:bg-muted/50",
                          )}
                        >
                          <div className="flex min-w-0 items-center gap-2">
                            <ModelIcon
                              small
                              src={provider}
                              alt={provider.providerName}
                            />
                            <span className="truncate text-[13px] font-medium text-foreground/90">
                              {getLocalizedText(model.label, locale) || model.model}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
};
