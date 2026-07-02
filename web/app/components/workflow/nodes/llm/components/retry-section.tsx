import { Checkbox } from "@/app/ui/checkbox";
import { NodeInput } from "../../../components/base/node-input";
import type { LLMNodeData } from "../types";
import { useTranslation } from "react-i18next";

type RetrySectionProps = {
  retryOnFailure: boolean;
  retryCount: number;
  retryIntervalMs: number;
  onChange: (patch: Partial<LLMNodeData>) => void;
};

export const RetrySection = ({ retryOnFailure, retryCount, retryIntervalMs, onChange }: RetrySectionProps) => {
  const { t } = useTranslation();
  return (
    <section className="space-y-3 rounded-xl bg-muted/15 px-4 py-4">
      <div className="text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">{t('workflow.nodes.llm.retryOnFailure2')}</div>

      <label className="flex items-start gap-3 rounded-lg border border-[var(--border)] bg-background px-3 py-3">
        <Checkbox
          checked={retryOnFailure}
          onChange={(event) => onChange({ retryOnFailure: event.target.checked })}
          className="mt-0.5"
        />
        <span className="min-w-0">
          <span className="block text-sm font-medium text-foreground">{t('workflow.nodes.llm.retryOnFailure2')}</span>
          <span className="mt-1 block text-xs leading-5 text-muted-foreground">
            {t('workflow.nodes.llm.retryOnFailureDescription')}
          </span>
        </span>
      </label>

      {retryOnFailure && (
        <div className="grid gap-3 md:grid-cols-2">
          <label className="block">
            <div className="mb-1 text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">{t('workflow.nodes.llm.maxRetryCount')}</div>
            <NodeInput
              type="number"
              min={1}
              step={1}
              value={retryCount}
              onChange={(event) => {
                const value = Number.parseInt(event.target.value, 10);
                onChange({ retryCount: Number.isFinite(value) && value > 0 ? value : 1 });
              }}
            />
          </label>

          <label className="block">
            <div className="mb-1 text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">{t('workflow.nodes.llm.retryInterval')}</div>
            <NodeInput
              type="number"
              min={0}
              step={100}
              value={retryIntervalMs}
              onChange={(event) => {
                const value = Number.parseInt(event.target.value, 10);
                onChange({ retryIntervalMs: Number.isFinite(value) && value >= 0 ? value : 0 });
              }}
            />
          </label>
        </div>
      )}
    </section>
  );
};
