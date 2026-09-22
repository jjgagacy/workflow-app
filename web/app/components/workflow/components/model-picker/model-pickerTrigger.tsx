import { ChevronDown } from "lucide-react";
import { useTranslation } from "react-i18next";
import { getClientLocale, getLocalizedText } from "@/i18n";
import { getLanguage } from "@/i18n/config";
import { cn } from "@/utils/classnames";
import type { ModelProviderModels, SelectModel } from "@/types/model";
import { ModelIcon } from "./model-icon";

type ModelPickerTriggerProps = {
  selectedModel?: SelectModel;
  modelList?: ModelProviderModels[];
  readonly?: boolean;
  placeholder?: string;
};

export const ModelPickerTrigger = ({
  selectedModel,
  modelList = [],
  readonly,
  placeholder,
}: ModelPickerTriggerProps) => {
  const { t } = useTranslation();
  const locale = getLanguage(getClientLocale());

  const selectedProvider = modelList.find((provider) =>
    provider.models.some((model) => provider.providerName === selectedModel?.provider && model.model === selectedModel?.model),
  );

  const selectedModelInfo = selectedProvider?.models.find(
    (model) => selectedProvider?.providerName === selectedModel?.provider && model.model === selectedModel?.model,
  );

  const displayLabel = selectedModelInfo ? getLocalizedText(selectedModelInfo.label, locale) || selectedModelInfo.model : placeholder || t("workflow.nodes.llm.selectModel");
  const providerIcon = selectedProvider?.icon ? getLocalizedText(selectedProvider.icon, locale) : "";

  return (
    <div
      className={cn(
        "flex h-[38px] min-h-[38px] w-full items-center justify-between gap-2 rounded-md border border-[var(--border)] bg-background px-3 py-1.5 text-left text-sm transition-colors hover:bg-muted/10",
        !selectedModel && "text-muted-foreground",
        readonly && "cursor-not-allowed opacity-60",
      )}
    >
      <div className="flex min-w-0 items-center gap-2">
        {selectedProvider && (
          <ModelIcon
            small
            src={selectedProvider}
          />
        )}
        <span className="truncate">{displayLabel}</span>
      </div>

      <ChevronDown className="h-3.5 w-3.5 shrink-0 text-neutral-400" />
    </div>
  );
};
