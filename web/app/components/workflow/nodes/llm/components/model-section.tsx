import { useTranslation } from "react-i18next";
import type { LLMNodeData } from "../types";
import { useModelProviderContext } from "@/context/model-provider-context";
import { ModelPicker } from "../../../components/model-picker";
import { toSelectModel } from "@/types/model";

type ModelSectionProps = {
  modelId: string;
  provider: string;
  onChange: (patch: Partial<LLMNodeData>) => void;
};

export const ModelSection = ({ modelId, provider, onChange }: ModelSectionProps) => {
  const { t } = useTranslation();
  const { modelProviderModels } = useModelProviderContext();

  return (
    <section className="space-y-3 rounded-xl bg-muted/15 px-4 py-4">
      <div className="text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">{t("workflow.nodes.llm.selectModel")}</div>
      <ModelPicker
        selectedModel={toSelectModel(modelProviderModels, provider, modelId)}
        modelList={modelProviderModels}
        onSelect={(model) => onChange({ modelId: model.model, provider: model.provider })}
      />
    </section>
  );
};
