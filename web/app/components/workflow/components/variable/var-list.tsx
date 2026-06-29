// var-list.tsx
import React from "react";
import { CirclePlus, Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { SimpleSelect } from "@/app/ui/select";
import { Node } from "../../types";
import { useStoreApi } from "@xyflow/react";
import { buildVariableSelectItems, buildWorkflowVariableOptions } from "../../components/nodes-shared/variable-select";
import { useWorkflowStore } from "../../context";
import { CodeInputParameter, CodeNodeData } from "../../nodes/code/types";

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

  const inputClassName = 'w-full rounded-md border border-[var(--border)] bg-background px-3 py-2 text-sm text-foreground outline-none transition-colors focus:border-primary/60';

  return (
    <section className="space-y-3 rounded-xl bg-muted/15 px-4 py-4">
      <div className="flex items-center justify-between gap-2">
        <div className="text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">输入变量</div>
        <button
          type="button"
          onClick={onAddInputParameter}
          className="inline-flex items-center gap-1.5 rounded-md border border-[var(--border)] bg-background px-2.5 py-1.5 text-xs text-foreground transition-colors hover:bg-muted/70"
        >
          <CirclePlus className="h-3.5 w-3.5" />
          添加参数
        </button>
      </div>

      {inputParameters.length === 0 ? (
        <div className="rounded-md border border-dashed border-[var(--border)] bg-background px-3 py-2 text-xs text-muted-foreground">
          暂无输入参数，可点击上方按钮添加。
        </div>
      ) : (
        <div className="space-y-2">
          {inputParameters.map((parameter, index) => {
            const valueItems = buildVariableSelectItems({
              t,
              currentValue: String(parameter.valueSource ?? ''),
              options: variableOptions,
            });

            return (
              <div key={parameter.id} className="rounded-lg border border-[var(--border)] bg-background px-3 py-3">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <div className="text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">
                    参数 {index + 1}
                  </div>
                  <button
                    type="button"
                    onClick={() => onRemoveInputParameter(parameter.id)}
                    className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground"
                    aria-label="删除输入参数"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>

                <div className="grid gap-3 md:grid-cols-2">
                  <label className="block">
                    <div className="mb-1 text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">变量名称</div>
                    <input
                      value={parameter.name}
                      onChange={(event) => onUpsertInputParameter(parameter.id, { name: event.target.value })}
                      placeholder="例如: orderId"
                      className={inputClassName}
                    />
                  </label>

                  <div className="block md:col-span-1">
                    <div className="mb-1 text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">变量值</div>
                    <SimpleSelect
                      items={valueItems}
                      defaultValue={parameter.valueSource}
                      allowSearch={false}
                      className="w-full"
                      onSelect={(item) => onUpsertInputParameter(parameter.id, { valueSource: String(item.value) })}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
};