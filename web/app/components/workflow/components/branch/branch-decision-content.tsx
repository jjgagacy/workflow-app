import { CirclePlus } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { ConditionBranch, ConditionOperator, OperatorType } from "../../nodes/if-else/types";
import type { OperatorOption } from "../../nodes/if-else/hooks/use-operatorOptions";
import type { SelectItem, VariableOption } from "../../nodes/if-else/components/branch-list.types";
import { BranchConditionItem } from "./branch-condition-item";
import type { NodeOutputVariable, Node } from "../../types";

type BranchDecisionContentProps = {
  nodeId: string;
  branch: ConditionBranch;
  typeItems: SelectItem[];
  operatorOptionsByType: Record<OperatorType, OperatorOption[]>;
  variableOptions: VariableOption[];
  nodeOutputVariables: NodeOutputVariable[];
  availableNodes: Node[];
  onConditionGroupOperatorToggle: (branchId: string, currentValue: ConditionBranch["conditionGroup"]["logicalOperator"]) => void;
  onRemoveCondition: (branchId: string, conditionId: string) => void;
  onConditionTypeChange: (branchId: string, conditionId: string, value: OperatorType) => void;
  onConditionFieldChange: (branchId: string, conditionId: string, key: "leftValue" | "rightValue", value: string) => void;
  onConditionOperatorChange: (branchId: string, conditionId: string, value: ConditionOperator) => void;
  onConditionVariableChange: (branchId: string, conditionId: string, value: { nodeId: string; path: string[] }) => void;
  onAddCondition: (branchId: string) => void;
};

export const BranchDecisionContent = ({
  nodeId,
  branch,
  typeItems,
  operatorOptionsByType,
  variableOptions,
  onConditionGroupOperatorToggle,
  onRemoveCondition,
  onConditionTypeChange,
  onConditionFieldChange,
  onConditionOperatorChange,
  onConditionVariableChange,
  onAddCondition,
  nodeOutputVariables,
  availableNodes,
}: BranchDecisionContentProps) => {
  const { t } = useTranslation();
  const conditions = branch.conditionGroup.conditions ?? [];

  return (
    <>
      <div className="mt-4 grid grid-cols-[52px_minmax(0,1fr)] gap-3">
        <div className="relative flex min-h-full flex-col items-center justify-center py-3">
          {/* 连接线：保持在左侧 42px */}
          <div className="absolute top-3 bottom-3 inset-y-0 left-[42px] w-2.5 rounded-l-[8px] border border-r-0 border-[var(--border)]/80" />
          {/* 背景遮罩：覆盖连接线的右半部分 */}
          <div className="absolute top-1/2 left-[38px] h-[22px] w-[18px] -translate-y-1/2 bg-[var(--panel-bg)]" />
          {/* 按钮：精确覆盖在连接线上方 */}
          <button
            type="button"
            onClick={() => onConditionGroupOperatorToggle(branch.id, branch.conditionGroup.logicalOperator)}
            className="absolute top-1/2 left-[25px] w-10 z-40 -translate-y-1/2 flex items-center justify-center gap-1 rounded-md border-[0.5px] border-[var(--border)] bg-background px-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--text-accent-secondary)] shadow-xs select-none transition-colors hover:bg-muted/40"
            aria-label={t("workflow.conditions.toggleBranchLogic", { logic: branch.conditionGroup.logicalOperator.toUpperCase() })}
          >
            {branch.conditionGroup.logicalOperator.toUpperCase()}
          </button>
        </div>

        <div className="min-w-0 space-y-2 rounded-2xl bg-muted/15 px-3 py-2">
          {conditions.map((condition, conditionIndex) => (
            <BranchConditionItem
              key={condition.id}
              nodeId={nodeId}
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
              onConditionVariableChange={onConditionVariableChange}
              nodeOutputVariables={nodeOutputVariables}
              availableNodes={availableNodes}
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
