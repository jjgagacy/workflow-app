import { useMemo } from "react";
import { GitBranchPlus } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useIfElseBranchHandlers, useIfElseOperatorOptions } from "@/app/components/workflow/nodes/if-else/hooks";
import { IfElseBranchList } from "@/app/components/workflow/nodes/if-else/components";
import { normalizeIfElseBranches } from "@/app/components/workflow/nodes/if-else/data";
import type { IfElseNodeData } from "@/app/components/workflow/nodes/if-else/types";
import { useConditionVariableOptions } from "../../hooks/use-condition-variable-options";
import { Node } from "../../types";
import BranchLogicInfo from "./branch-logic-info";
import { useVariableList } from "../../nodes/if-else/hooks/use-variableList";

type SharedConditionPanelProps = {
  node: Node<IfElseNodeData>;
  outputHandleCount?: number;
};

export const SharedConditionPanel = ({ node, outputHandleCount }: SharedConditionPanelProps) => {
  const { t } = useTranslation();
  const { operatorOptionsByType, typeItems } = useIfElseOperatorOptions();
  const branches = useMemo(() => normalizeIfElseBranches(node.data.branches), [node.data.branches]);
  const {
    handleAddBranch,
    handleRemoveBranch,
    handleMoveBranch,
    handleBranchNameChange,
    handleConditionGroupOperatorToggle,
    handleAddCondition,
    handleRemoveCondition,
    handleConditionTypeChange,
    handleConditionOperatorChange,
    handleConditionFieldChange,
  } = useIfElseBranchHandlers({ node, branches });
  const { nodesOutputList } = useVariableList(node.id);
  const decisionBranchCount = branches.filter((branch) => !branch.isDefault).length;
  const resolvedOutputHandleCount = outputHandleCount ?? branches.length;
  const { variableOptions, variableOptionGroups } = useConditionVariableOptions(node.id);

  return (
    <div className="space-y-0">
      <BranchLogicInfo
        decisionBranchCount={decisionBranchCount}
        resolvedOutputHandleCount={resolvedOutputHandleCount}
      />

      <IfElseBranchList
        branches={branches}
        decisionBranchCount={decisionBranchCount}
        operatorOptionsByType={operatorOptionsByType}
        typeItems={typeItems}
        variableOptions={variableOptions}
        variableOptionGroups={variableOptionGroups}
        handleBranchNameChange={handleBranchNameChange}
        handleMoveBranch={handleMoveBranch}
        handleRemoveBranch={handleRemoveBranch}
        handleConditionGroupOperatorToggle={handleConditionGroupOperatorToggle}
        handleRemoveCondition={handleRemoveCondition}
        handleConditionTypeChange={handleConditionTypeChange}
        handleConditionFieldChange={handleConditionFieldChange}
        handleConditionOperatorChange={handleConditionOperatorChange}
        handleAddCondition={handleAddCondition}
      />

      <button
        type="button"
        onClick={handleAddBranch}
        className="mt-4 inline-flex items-center gap-2 rounded-md border border-[var(--border)] bg-background px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted/70"
      >
        <GitBranchPlus className="h-4 w-4" />
        {t('workflow.conditions.addBranchBeforeElse')}
      </button>
    </div>
  );
};