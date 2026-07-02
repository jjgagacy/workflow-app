import { SimpleSelect } from "@/app/ui/select";
import { NodeTextarea } from "../../../components/base/node-textarea";
import type { LLMExceptionStrategy, LLMNodeData } from "../types";
import { useLLM } from "../hooks";
import { useTranslation } from "react-i18next";

type ExceptionSectionProps = {
  exceptionStrategy: LLMExceptionStrategy;
  exceptionDefaultValue: string;
  onChange: (patch: Partial<LLMNodeData>) => void;
};

export const ExceptionSection = ({ exceptionStrategy, exceptionDefaultValue, onChange }: ExceptionSectionProps) => {
  const { t } = useTranslation();
  const { exceptionStrategyItems } = useLLM();

  return (
    <section className="space-y-3 rounded-xl bg-muted/15 px-4 py-4">
      <div className="text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">{t('workflow.nodes.llm.exceptionHandling')}</div>

      <SimpleSelect
        items={exceptionStrategyItems}
        defaultValue={exceptionStrategy}
        allowSearch={false}
        className="w-full"
        onSelect={(item) => onChange({ exceptionStrategy: item.value as LLMExceptionStrategy })}
      />

      {exceptionStrategy === "return-default" && (
        <label className="block">
          <div className="mb-1 text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">{t('workflow.nodes.llm.defaultReturnValue')}</div>
          <NodeTextarea
            value={exceptionDefaultValue}
            onChange={(event) => onChange({ exceptionDefaultValue: event.target.value })}
            placeholder={t('workflow.nodes.llm.defaultReturnValuePlaceholder')}
            rows={3}
            className="min-h-[88px]"
          />
        </label>
      )}
    </section>
  );
};
