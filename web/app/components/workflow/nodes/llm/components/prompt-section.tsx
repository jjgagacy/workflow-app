import { useTranslation } from "react-i18next";
import { NodeTextarea } from "../../../components/base/node-textarea";
import type { LLMNodeData } from "../types";

type PromptSectionProps = {
  systemPrompt: string;
  userPrompt: string;
  assistantPrompt: string;
  onChange: (patch: Partial<LLMNodeData>) => void;
};

export const PromptSection = ({ systemPrompt, userPrompt, assistantPrompt, onChange }: PromptSectionProps) => {
  const { t } = useTranslation();
  return (
    <section className="space-y-3 rounded-xl bg-muted/15 px-4 py-4">
      <div className="text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">{t('workflow.nodes.llm.prompt')}</div>
      <label className="block">
        <div className="mb-1 text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">{t('workflow.nodes.llm.systemPrompt')}</div>
        <NodeTextarea
          value={systemPrompt}
          onChange={(event) => onChange({ systemPrompt: event.target.value })}
          placeholder={t('workflow.nodes.llm.systemPromptPlaceholder')}
          rows={3}
          className="min-h-[88px]"
        />
      </label>

      <label className="block">
        <div className="mb-1 text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">{t('workflow.nodes.llm.userPrompt')}</div>
        <NodeTextarea
          value={userPrompt}
          onChange={(event) => onChange({ userPrompt: event.target.value })}
          placeholder={t('workflow.nodes.llm.userPromptPlaceholder')}
          rows={4}
          className="min-h-[104px]"
        />
      </label>

      <label className="block">
        <div className="mb-1 text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">{t('workflow.nodes.llm.assistantPrompt')}</div>
        <NodeTextarea
          value={assistantPrompt}
          onChange={(event) => onChange({ assistantPrompt: event.target.value })}
          placeholder={t('workflow.nodes.llm.assistantPromptPlaceholder')}
          rows={3}
          className="min-h-[88px]"
        />
      </label>
    </section>
  );
};
