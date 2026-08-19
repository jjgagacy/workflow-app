import { CirclePlus } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { ConditionBranch, ConditionOperator, OperatorType } from "../types";
import type { OperatorOption } from "../hooks/use-operatorOptions";
import type { SelectItem, VariableOption } from "./branch-list.types";
import { BranchConditionItem } from "./branch-condition-item";

type BranchDecisionContentProps = {
  branch: ConditionBranch;
  typeItems: SelectItem[];
  operatorOptionsByType: Record<OperatorType, OperatorOption[]>;
  variableOptions: VariableOption[];
  onConditionGroupOperatorToggle: (branchId: string, currentValue: ConditionBranch["conditionGroup"]["logicalOperator"]) => void;
  onRemoveCondition: (branchId: string, conditionId: string) => void;
  onConditionTypeChange: (branchId: string, conditionId: string, value: OperatorType) => void;
  onConditionFieldChange: (branchId: string, conditionId: string, key: "leftValue" | "rightValue", value: string) => void;
  onConditionOperatorChange: (branchId: string, conditionId: string, value: ConditionOperator) => void;
  onAddCondition: (branchId: string) => void;
};

export const BranchDecisionContent = ({
  branch,
  typeItems,
  operatorOptionsByType,
  variableOptions,
  onConditionGroupOperatorToggle,
  onRemoveCondition,
  onConditionTypeChange,
  onConditionFieldChange,
  onConditionOperatorChange,
  onAddCondition,
}: BranchDecisionContentProps) => {
  const { t } = useTranslation();
  const conditions = branch.conditionGroup.conditions ?? [];

  return (
    <>
      <div className="mt-4 grid grid-cols-[52px_minmax(0,1fr)] gap-3">
        <div className="flex min-h-full flex-col items-center justify-center py-2">
          <div className="w-px flex-1 bg-[var(--border)]/80" />
          <button
            type="button"
            onClick={() => onConditionGroupOperatorToggle(branch.id, branch.conditionGroup.logicalOperator)}
            className="my-2 rounded-full bg-background px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-foreground shadow-sm ring-1 ring-[var(--border)] transition-colors hover:bg-muted/40"
            aria-label={t("workflow.conditions.toggleBranchLogic", { logic: branch.conditionGroup.logicalOperator.toUpperCase() })}
          >
            {branch.conditionGroup.logicalOperator.toUpperCase()}
          </button>
          <div className="w-px flex-1 bg-[var(--border)]/80" />
        </div>

        <div className="min-w-0 space-y-2 rounded-2xl bg-muted/15 px-3 py-2">
          {conditions.map((condition, conditionIndex) => (
            <BranchConditionItem
              key={condition.id}
              branchId={branch.id}
              condition={condition}
              conditionIndex={conditionIndex}
              operatorOptionsByType={operatorOptionsByType}
              variableOptions={variableOptions}
              typeItems={typeItems}
              onRemoveCondition={onRemoveCondition}
              onConditionTypeChange={onConditionTypeChange}
              onConditionFieldChange={onConditionFieldChange}
              onConditionOperatorChange={onConditionOperatorChange}
            />
          ))}
        </div>
      </div>

      <button
        type="button"
        onClick={() => onAddCondition(branch.id)}
        className="mt-3 inline-flex items-center gap-2 rounded-md border border-[var(--border)] bg-background px-3 py-2 text-sm text-foreground transition-colors hover:bg-muted/70"
      >
        <CirclePlus className="h-4 w-4" />
        {t("workflow.conditions.addCondition")}
      </button>
    </>
  );
};
