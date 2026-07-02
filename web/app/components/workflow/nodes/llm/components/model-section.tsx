import { SimpleSelect } from "@/app/ui/select";
import { useTranslation } from "react-i18next";
import { getWorkflowModelSelectItems } from "../../../components/nodes-shared/model-options";
import type { LLMNodeData } from "../types";

type ModelSectionProps = {
  modelId: string;
  onChange: (patch: Partial<LLMNodeData>) => void;
};

export const ModelSection = ({ modelId, onChange }: ModelSectionProps) => {
  const { t } = useTranslation();
  const modelItems = getWorkflowModelSelectItems();

  return (
    <section className="space-y-3 rounded-xl bg-muted/15 px-4 py-4">
      <div className="text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">{t("workflow.nodes.llm.model")}</div>
      <SimpleSelect
        items={modelItems}
        defaultValue={modelId}
        allowSearch={false}
        className="w-full"
        onSelect={(item) => onChange({ modelId: String(item.value) })}
      />
    </section>
  );
};
