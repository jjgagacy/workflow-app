import { getClientLocale, getLocalizedText } from "@/i18n";
import type { ModelProviderModels, SelectModel } from "@/types/model";
import { cn } from "@/utils/classnames";
import { ModelIcon } from "./model-icon";
import { getLanguage } from "@/i18n/config";

type ProviderWithVisibleModels = ModelProviderModels & {
  visibleModels: ModelProviderModels["models"];
};

type ModelPopItemProps = {
  provider: ProviderWithVisibleModels;
  selectedModel?: SelectModel;
  onSelect: (model: SelectModel) => void;
};

export const ModelPopItem = ({
  provider,
  selectedModel,
  onSelect,
}: ModelPopItemProps) => {
  const locale = getLanguage(getClientLocale());
  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-2 px-1.5 py-1 text-[11px] font-medium uppercase tracking-[0.08em] text-muted-foreground">
        <ModelIcon small src={provider} alt={provider.providerName} />
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
                <ModelIcon small src={provider} alt={provider.providerName} />
                <span className="truncate text-[13px] font-medium text-foreground/90">
                  {getLocalizedText(model.label, locale) || model.model}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
