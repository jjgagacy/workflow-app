import { CirclePlus, Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { SimpleSelect } from "@/app/ui/select";
import { Node } from "../../types";
import { buildVariableSelectItems, buildWorkflowVariableOptions } from "../../components/nodes-shared/variable-select";
import { CodeInputParameter, CodeNodeData } from "./types";

type VarListProps = {
  node: Node<CodeNodeData>;
  inputParameters: CodeInputParameter[];
  variableOptions: ReturnType<typeof buildWorkflowVariableOptions>;
  onUpsertInputParameter: (parameterId: string, patch: Partial<CodeInputParameter>) => void;
  onRemoveInputParameter: (parameterId: string) => void;
  onAddInputParameter: () => void;
};

export const VarList = ({
  node,
  inputParameters,
  variableOptions,
  onUpsertInputParameter,
  onRemoveInputParameter,
  onAddInputParameter,
}: VarListProps) => {
  const { t } = useTranslation();

  return (
    <section className="space-y-2 rounded-xl bg-muted/15 px-3 py-3">
      {/* 头部 */}
      <div className="flex items-center justify-between gap-2">
        <span className="text-[10px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
          {t('workflow.nodes.code.input_variable')}
        </span>
        <button
          type="button"
          onClick={onAddInputParameter}
          className="inline-flex items-center gap-1 rounded-md border border-[var(--border)] bg-background px-2 py-1 text-[10px] text-foreground transition-colors hover:bg-muted/70"
        >
          <CirclePlus className="h-3 w-3" />
          {t('workflow.nodes.code.add')}
        </button>
      </div>

      {inputParameters.length === 0 ? (
        <div className="rounded-md border border-dashed border-[var(--border)] bg-background px-3 py-2 text-xs text-muted-foreground">
          {t('workflow.nodes.code.no_input_parameters')}
        </div>
      ) : (
        <div className="space-y-1.5">
          {inputParameters.map((parameter, index) => {
            const valueItems = buildVariableSelectItems({
              t,
              currentValue: String(parameter.valueSource ?? ''),
              options: variableOptions,
            });

            return (
              <div
                key={parameter.id}
                className="rounded-lg border border-[var(--border)] bg-background px-3 py-2"
              >
                <div className="flex items-center gap-2">
                  {/* 序号和删除 */}
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-muted/50 text-[9px] font-medium text-muted-foreground">
                    {index + 1}
                  </span>

                  {/* 变量名称 */}
                  <div className="flex-1 min-w-0">
                    <input
                      value={parameter.name}
                      onChange={(event) => onUpsertInputParameter(parameter.id, { name: event.target.value })}
                      placeholder={t('workflow.nodes.code.input_variable')}
                      className="w-full rounded-md border border-[var(--border)] bg-background px-2 py-1 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground/40 focus:border-primary/60"
                    />
                  </div>

                  {/* 删除按钮 */}
                  <button
                    type="button"
                    onClick={() => onRemoveInputParameter(parameter.id)}
                    className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-muted-foreground/40 transition-colors hover:bg-destructive/10 hover:text-destructive"
                    aria-label={t('workflow.nodes.code.delete_input_parameter')}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>

                {/* 第二行：变量值 */}
                <div className="mt-1.5 pl-7">
                  <SimpleSelect
                    items={valueItems}
                    defaultValue={parameter.valueSource}
                    allowSearch={false}
                    className="w-full"
                    onSelect={(item) => onUpsertInputParameter(parameter.id, { valueSource: String(item.value) })}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
};