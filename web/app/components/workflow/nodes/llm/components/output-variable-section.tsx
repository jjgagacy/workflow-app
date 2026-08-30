import { useTranslation } from "react-i18next";

type OutputField = {
  name: string;
  description: string;
};

type OutputVariableSectionProps = {
  outputVariableName: string;
  outputFields: OutputField[];
};

export const OutputVariableSection = ({ outputVariableName, outputFields }: OutputVariableSectionProps) => {
  const { t } = useTranslation();

  return (
    <section className="space-y-3 rounded-xl bg-muted/15 px-4 py-4">
      <div className="block">
        <div className="mb-2 text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">
          {t('workflow.nodes.llm.outputVariable')}
        </div>

        <div className="rounded-lg border border-[var(--border)] bg-background p-2.5">
          <div className="mb-2 flex items-center gap-2 text-[11px] text-muted-foreground">
            <span className="inline-flex items-center rounded bg-primary/10 px-2 py-1 font-medium text-primary">
              {outputVariableName}
            </span>
            <span className="text-muted-foreground/70">=</span>
            <span className="rounded bg-muted/50 px-2 py-1 font-medium text-foreground">object</span>
          </div>
          <div className="rounded-md border border-dashed border-[var(--border)] bg-muted/20 p-2">
            <div className="mb-2 text-[10px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
              {t('workflow.nodes.llm.outputFields')}
            </div>
            <div className="space-y-2">
              {outputFields.map((field) => (
                <div
                  key={field.name}
                  className="rounded-md border border-[var(--border)] bg-background px-2 py-1.5"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-[11px] font-medium text-foreground">{field.name}</span>
                    <span className="text-[9px] text-muted-foreground">{field.description}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
