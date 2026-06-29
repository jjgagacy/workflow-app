import React from "react";
import { SimpleSelect } from "@/app/ui/select";
import { CodeExceptionStrategy } from "../../nodes/code/types";
import { useExceptionStrategyItems } from "../../hooks/use-exception-strategy";
import { useTranslation } from "react-i18next";

type ExceptionHandlerProps = {
  exceptionStrategy: CodeExceptionStrategy;
  exceptionDefaultValue: string;
  onExceptionConfigChange: (patch: { exceptionStrategy?: CodeExceptionStrategy; exceptionDefaultValue?: string }) => void;
};

export const ExceptionHandler = ({
  exceptionStrategy,
  exceptionDefaultValue,
  onExceptionConfigChange,
}: ExceptionHandlerProps) => {
  const { t } = useTranslation();
  const exceptionStrategyItems = useExceptionStrategyItems();

  return (
    <section className="space-y-3 rounded-xl bg-muted/15 px-4 py-4">
      <div className="text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">{t('workflow.errorHandler.exceptionStrategy')}</div>

      <div className="block">
        <SimpleSelect
          items={exceptionStrategyItems}
          defaultValue={exceptionStrategy}
          allowSearch={false}
          className="w-full"
          onSelect={(item) => onExceptionConfigChange({ exceptionStrategy: item.value as CodeExceptionStrategy })}
        />
      </div>

      {exceptionStrategy === 'return-default' && (
        <label className="block">
          <div className="mb-1 text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">{t('workflow.errorHandler.returnDefault')}</div>
          <input
            value={exceptionDefaultValue}
            onChange={(event) => onExceptionConfigChange({ exceptionDefaultValue: event.target.value })}
            placeholder={t('workflow.errorHandler.placeholder')}
            className={`w-full rounded-md border border-[var(--border)] bg-background px-3 py-2 text-sm text-foreground outline-none transition-colors focus:border-primary/60`}
          />
        </label>
      )}
    </section>
  );
};