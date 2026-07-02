import { CirclePlus } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { ListOperatorCondition, ListOperatorLogicalOperator, SelectItem } from "../types";
import { ConditionItem } from "./condition-item";

interface ConditionListProps {
  conditions: ListOperatorCondition[];
  logicalOperator: ListOperatorLogicalOperator;
  conditionOperatorItems: SelectItem[];
  onToggleLogicalOperator: () => void;
  onAddCondition: () => void;
  onUpdateCondition: (conditionId: string, patch: Partial<ListOperatorCondition>) => void;
  onRemoveCondition: (conditionId: string) => void;
}

export const ConditionList = ({
  conditions,
  logicalOperator,
  conditionOperatorItems,
  onToggleLogicalOperator,
  onAddCondition,
  onUpdateCondition,
  onRemoveCondition,
}: ConditionListProps) => {
  const { t } = useTranslation();

  return (
    <section className="space-y-3 rounded-xl bg-muted/15 px-4 py-4">
      <div className="flex items-center justify-between gap-2">
        <div className="text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">
          {t('workflow.nodes.list-operator.filterConditions')}
        </div>
        <button
          type="button"
          onClick={onAddCondition}
          className="inline-flex items-center gap-1.5 rounded-md border border-[var(--border)] bg-background px-2.5 py-1.5 text-xs text-foreground transition-colors hover:bg-muted/70"
        >
          <CirclePlus className="h-3.5 w-3.5" />
          {t('workflow.nodes.list-operator.addCondition')}
        </button>
      </div>

      <div className="grid grid-cols-[52px_minmax(0,1fr)] gap-3">
        {/* 左侧：逻辑运算符切换按钮 */}
        <div className="flex min-h-full flex-col items-center justify-center py-2">
          <div className="w-px flex-1 bg-[var(--border)]/80" />
          <button
            type="button"
            onClick={onToggleLogicalOperator}
            className="my-2 rounded-full bg-background px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-foreground shadow-sm ring-1 ring-[var(--border)] transition-colors hover:bg-muted/40"
            aria-label={t("workflow.nodes.list-operator.toggleBranchLogic", { logic: logicalOperator.toUpperCase() })}
          >
            {logicalOperator.toUpperCase()}
          </button>
          <div className="w-px flex-1 bg-[var(--border)]/80" />
        </div>

        {/* 右侧：条件列表 */}
        <div className="min-w-0 space-y-2 rounded-2xl bg-muted/15 px-3 py-2">
          {conditions.length === 0 ? (
            <div className="flex items-center justify-center py-4 text-xs text-muted-foreground">
              {t('workflow.nodes.list-operator.noCondition')}
            </div>
          ) : (
            conditions.map((condition, index) => (
              <ConditionItem
                key={condition.id}
                condition={condition}
                index={index}
                conditionOperatorItems={conditionOperatorItems}
                onUpdate={onUpdateCondition}
                onRemove={onRemoveCondition}
              />
            ))
          )}
        </div>
      </div>
    </section>
  );
};

export default ConditionList;