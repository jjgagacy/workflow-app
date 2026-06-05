import { useMemo } from "react";
import { CirclePlus, Trash2 } from "lucide-react";
import { useStoreApi } from "@xyflow/react";
import { useTranslation } from "react-i18next";
import { SimpleSelect } from "@/app/ui/select";
import { useIfElseOperatorOptions } from "../if-else/hooks";
import { Node, NodeType } from "../../types";
import type { ConditionOperator, OperatorType } from "../if-else/types";
import { useFilterConditionHandlers } from "./hooks/use-filter-condition-handlers";
import type { FilterNodeData } from "./types";
import { useWorkflowStore } from "../../context";

type FilterPanelProps = {
  node: Node<FilterNodeData>;
};

type VariableOption = {
  label: string;
  value: string;
  group: string;
  description?: string;
};

type SelectItem = {
  value: string;
  name: string;
  description?: string;
  group?: string;
};

const inputClassName = 'w-full rounded-md border border-[var(--border)] bg-background px-3 py-2 text-sm text-foreground outline-none transition-colors focus:border-primary/60';

const formatVariableType = (type?: string) => type ?? 'any';

const FilterPanel = ({ node }: FilterPanelProps) => {
  const { t } = useTranslation();
  const store = useStoreApi();
  const chatEnvVariables = useWorkflowStore((state) => state.chatEnvVariables);
  const envVariables = useWorkflowStore((state) => state.envVariables);
  const { operatorOptionsByType } = useIfElseOperatorOptions();
  const {
    branch,
    handleConditionGroupOperatorToggle,
    handleAddCondition,
    handleRemoveCondition,
    handleConditionTypeChange,
    handleConditionOperatorChange,
    handleConditionFieldChange,
  } = useFilterConditionHandlers({ node });
  const nodes = store.getState().nodes as Node[];
  const conditions = branch.conditionGroup.conditions ?? [];
  const typeItems: SelectItem[] = Object.keys(operatorOptionsByType).map((option) => ({
    value: option,
    name: option,
  }));

  const variableOptions = useMemo<VariableOption[]>(() => {
    const environmentOptions = envVariables.map((envVariable) => ({
      label: envVariable.name,
      value: `env.${envVariable.name}`,
      group: t('workflow.conditions.variableGroups.environment'),
      description: formatVariableType(envVariable.type),
    }));

    const sessionOptions = chatEnvVariables.map((envVariable) => ({
      label: envVariable.name,
      value: `session.${envVariable.name}`,
      group: t('workflow.conditions.variableGroups.session'),
      description: formatVariableType(envVariable.type),
    }));

    const builtInOptions: VariableOption[] = [
      { label: t('workflow.conditions.builtIns.workflowInput'), value: 'input', group: t('workflow.conditions.variableGroups.builtIn'), description: 'object' },
      { label: t('workflow.conditions.builtIns.currentUser'), value: 'system.user', group: t('workflow.conditions.variableGroups.builtIn'), description: 'object' },
      { label: t('workflow.conditions.builtIns.currentTime'), value: 'system.time', group: t('workflow.conditions.variableGroups.builtIn'), description: 'datetime' },
    ];

    const nodeOptions = nodes
      .filter((workflowNode) => workflowNode.id !== node.id && workflowNode.data.type !== NodeType.Start)
      .map((workflowNode) => ({
        label: workflowNode.data.label?.trim() || workflowNode.id,
        value: `nodes.${workflowNode.id}.output`,
        group: t('workflow.conditions.variableGroups.nodeOutputs'),
        description: 'any',
      }));

    return [...builtInOptions, ...environmentOptions, ...sessionOptions, ...nodeOptions];
  }, [chatEnvVariables, envVariables, node.id, nodes, t]);

  return (
    <div className="space-y-4">
      <div className="rounded-lg bg-muted/20 px-4 py-3">
        <div className="text-sm font-semibold text-foreground">{t('workflow.nodes.filter.name')}</div>
        <div className="mt-1 text-xs leading-5 text-muted-foreground">
          {t('workflow.nodes.filter.description')}
        </div>
        <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
          <span className="rounded-full bg-background px-2.5 py-1">
            {branch.conditionGroup.logicalOperator.toUpperCase()}
          </span>
          <span className="rounded-full bg-background px-2.5 py-1">
            {t('workflow.conditions.conditionCount', { count: conditions.length })}
          </span>
        </div>
      </div>

      <section className="rounded-xl bg-transparent px-1 py-2">
        <div className="grid grid-cols-[52px_minmax(0,1fr)] gap-3">
          <div className="flex min-h-full flex-col items-center justify-center py-2">
            <div className="w-px flex-1 bg-[var(--border)]/80" />
            <button
              type="button"
              onClick={() => handleConditionGroupOperatorToggle(branch.conditionGroup.logicalOperator)}
              className="my-2 rounded-full bg-background px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-foreground shadow-sm ring-1 ring-[var(--border)] transition-colors hover:bg-muted/40"
            >
              {branch.conditionGroup.logicalOperator.toUpperCase()}
            </button>
            <div className="w-px flex-1 bg-[var(--border)]/80" />
          </div>

          <div className="min-w-0 space-y-2 rounded-2xl bg-muted/15 px-3 py-2">
            {conditions.map((condition, conditionIndex) => {
              const conditionType = (condition.operator.leftType ?? 'string') as OperatorType;
              const operatorOptions = operatorOptionsByType[conditionType] ?? [];
              const operatorItems: SelectItem[] = operatorOptions.map((option) => ({
                value: option.value,
                name: option.label,
              }));
              const leftValue = String(condition.leftValue ?? '');
              const variableItems: SelectItem[] = [
                ...(!leftValue ? [{ value: '', name: t('workflow.conditions.selectVariable') }] : []),
                ...(
                  leftValue && !variableOptions.some((option) => option.value === leftValue)
                    ? [{ value: leftValue, name: leftValue, description: t('workflow.conditions.currentValue') }]
                    : []
                ),
                ...variableOptions.map((option) => ({
                  value: option.value,
                  name: option.label,
                  description: option.description,
                  group: option.group,
                })),
              ];
              const selectedOperator = operatorOptions.find((operator) => operator.value === condition.operator.operator);
              const isUnary = selectedOperator?.isUnary ?? Boolean(condition.operator.isUnary);

              return (
                <div key={condition.id} className="rounded-xl bg-background px-3 py-3">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <div className="text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">
                      {t('workflow.conditions.conditionLabel', { index: conditionIndex + 1 })}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveCondition(condition.id)}
                      className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground"
                      aria-label={t('workflow.conditions.removeCondition')}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  <div className="grid gap-3 md:grid-cols-2">
                    <div className="block">
                      <div className="mb-1 text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">{t('workflow.conditions.type')}</div>
                      <SimpleSelect
                        items={typeItems}
                        defaultValue={conditionType}
                        allowSearch={false}
                        className="w-full"
                        onSelect={(item) => handleConditionTypeChange(condition.id, item.value as OperatorType)}
                      />
                    </div>

                    <div className="block">
                      <div className="mb-1 text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">{t('workflow.conditions.leftVariable')}</div>
                      <SimpleSelect
                        items={variableItems}
                        defaultValue={leftValue}
                        allowSearch={false}
                        className="w-full"
                        onSelect={(item) => handleConditionFieldChange(condition.id, 'leftValue', String(item.value))}
                      />
                    </div>

                    <div className="block md:col-span-2">
                      <div className="mb-1 text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">{t('workflow.conditions.operator')}</div>
                      <SimpleSelect
                        items={operatorItems}
                        defaultValue={condition.operator.operator}
                        allowSearch={false}
                        className="w-full"
                        onSelect={(item) => handleConditionOperatorChange(condition.id, item.value as ConditionOperator)}
                      />
                    </div>

                    {!isUnary ? (
                      <label className="block md:col-span-2">
                        <div className="mb-1 text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">{t('workflow.conditions.rightValue')}</div>
                        <input
                          value={String(condition.rightValue ?? '')}
                          onChange={(event) => handleConditionFieldChange(condition.id, 'rightValue', event.target.value)}
                          placeholder={t('workflow.conditions.rightValuePlaceholder')}
                          className={inputClassName}
                        />
                      </label>
                    ) : (
                      <div className="rounded-md bg-muted/20 px-3 py-2 text-sm text-muted-foreground md:col-span-2">
                        {t('workflow.conditions.unaryOperatorHint')}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <button
          type="button"
          onClick={handleAddCondition}
          className="mt-3 inline-flex items-center gap-2 rounded-md border border-[var(--border)] bg-background px-3 py-2 text-sm text-foreground transition-colors hover:bg-muted/70"
        >
          <CirclePlus className="h-4 w-4" />
          {t('workflow.conditions.addCondition')}
        </button>
      </section>
    </div>
  );
};

export default FilterPanel;