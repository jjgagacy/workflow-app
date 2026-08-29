import { CirclePlus } from "lucide-react";
import { useTranslation } from "react-i18next";
import DeleteButton from "../../components/base/delete-button";
import { VarPicker } from "../../components/variable/var-picker";
import type { Node, Variable, VariableSelector } from "../../types";
import type { VariableAggregatorItem } from "./types";

type VariableAggregatorVarListProps = {
  variables: VariableAggregatorItem[];
  availableNodes?: Node[];
  nodeId: string;
  nodeOutputVariables?: ReturnType<typeof import("../../hooks/use-node-config").useNodeConfig>["nodeVariableList"];
  onAddVariable: () => void;
  onUpsertVariable: (variableId: string, patch: Partial<VariableAggregatorItem>) => void;
  onRemoveVariable: (variableId: string) => void;
};

const VariableAggregatorVarList = ({
  variables,
  availableNodes,
  nodeId,
  nodeOutputVariables,
  onAddVariable,
  onUpsertVariable,
  onRemoveVariable,
}: VariableAggregatorVarListProps) => {
  const { t } = useTranslation();

  return (
    <section className="space-y-2 rounded-xl bg-muted/15 px-3 py-3">
      <div className="flex items-center justify-between gap-2">
        <span className="text-[10px] font-medium uppercase tracking-[0.12em] text-muted-foreground">{t('workflow.nodes.variable-aggregator.variable_list')}</span>
        <button
          type="button"
          onClick={onAddVariable}
          className="inline-flex items-center gap-1 rounded-md border border-[var(--border)] bg-background px-2 py-1 text-[10px] text-foreground transition-colors hover:bg-muted/70"
        >
          <CirclePlus className="h-3 w-3" />
          {t('workflow.nodes.variable-aggregator.add_variable')}
        </button>
      </div>

      {variables.length === 0 ? (
        <div className="rounded-md border border-dashed border-[var(--border)] bg-background px-3 py-2 text-xs text-muted-foreground">
          {t('workflow.nodes.variable-aggregator.no_variables')}
        </div>
      ) : (
        <div className="space-y-1.5">
          {variables.map((item, index) => {
            const handleValueChange = (_variable: Variable, selector: VariableSelector) => {
              onUpsertVariable(item.id, { valueSource: selector });
            };

            return (
              <div key={item.id} className="rounded-lg border border-[var(--border)] bg-background px-3 py-2">
                <div className="flex items-center gap-2">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-muted/50 text-[9px] font-medium text-muted-foreground">
                    {index + 1}
                  </span>

                  <div className="min-w-0 flex-1 text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">
                    {t('workflow.nodes.variable-aggregator.variable')} {index + 1}
                  </div>

                  <DeleteButton
                    onClick={() => onRemoveVariable(item.id)}
                    ariaLabel={t('workflow.nodes.variable-aggregator.delete_variable')}
                    size="md"
                  />
                </div>

                <div className="mt-1.5 pl-7">
                  <VarPicker
                    nodeId={nodeId}
                    value={item.valueSource}
                    onChange={handleValueChange}
                    availableNodes={availableNodes}
                    nodeOutputVariables={nodeOutputVariables}
                    className="w-full"
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

export default VariableAggregatorVarList;