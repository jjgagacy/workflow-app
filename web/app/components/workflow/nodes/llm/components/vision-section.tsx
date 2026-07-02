import { Checkbox } from "@/app/ui/checkbox";
import type { LLMNodeData } from "../types";
import { useTranslation } from "react-i18next";

type VisionSectionProps = {
  enableVision: boolean;
  onChange: (patch: Partial<LLMNodeData>) => void;
};

export const VisionSection = ({ enableVision, onChange }: VisionSectionProps) => {
  const { t } = useTranslation();
  return (
    <section className="space-y-3 rounded-xl bg-muted/15 px-4 py-4">
      <div className="text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">{t('workflow.nodes.llm.visionAbility')}</div>
      <label className="flex items-start gap-3 rounded-lg border border-[var(--border)] bg-background px-3 py-3">
        <Checkbox
          checked={enableVision}
          onChange={(event) => onChange({ enableVision: event.target.checked })}
          className="mt-0.5"
        />
        <span className="min-w-0">
          <span className="block text-sm font-medium text-foreground">{t('workflow.nodes.llm.visionEnabled')}</span>
          <span className="mt-1 block text-xs leading-5 text-muted-foreground">
            {t('workflow.nodes.llm.visionDescription')}
          </span>
        </span>
      </label>
    </section>
  );
};
