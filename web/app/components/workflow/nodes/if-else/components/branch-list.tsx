import { cn } from "@/utils/classnames";
import { useTranslation } from "react-i18next";
import { getBranchTitle } from "../utils";
import { BranchDecisionContent } from "../../../components/branch/branch-decision-content";
import { BranchHeader } from "./branch-header";
import type { IfElseBranchListProps } from "./branch-list.types";

export const IfElseBranchList = ({
  nodeId,
  branches,
  decisionBranchCount,
  operatorOptionsByType,
  typeItems,
  variableOptions,
  variableOptionGroups,
  nodeOutputVariables,
  availableNodes,
  handleBranchNameChange,
  handleMoveBranch,
  handleRemoveBranch,
  handleConditionGroupOperatorToggle,
  handleRemoveCondition,
  handleConditionTypeChange,
  handleConditionFieldChange,
  handleConditionOperatorChange,
  handleConditionVariableChange,
  handleAddCondition,
}: IfElseBranchListProps) => {
  const { t } = useTranslation();

  return (
    <div className="mt-4 space-y-4">
      {branches.map((branch, index) => {
        const isDefault = Boolean(branch.isDefault);
        const disableRemoveBranch = !isDefault && decisionBranchCount <= 1;
        const disableMoveUp = !isDefault && index === 0;
        const disableMoveDown = !isDefault && index === decisionBranchCount - 1;
        const branchTitle = getBranchTitle(branch, index);

        return (
          <section
            key={branch.id}
            className={cn(
              'rounded-xl bg-transparent px-1 py-2',
              isDefault && 'bg-muted/5',
            )}
          >
            <BranchHeader
              branchId={branch.id}
              branchTitle={branchTitle}
              isDefault={isDefault}
              index={index}
              disableMoveUp={disableMoveUp}
              disableMoveDown={disableMoveDown}
              disableRemoveBranch={disableRemoveBranch}
              onBranchNameChange={(value, branchIndex, defaultBranch) =>
                handleBranchNameChange(branch.id, value, branchIndex, defaultBranch)
              }
              onMoveBranch={handleMoveBranch}
              onRemoveBranch={handleRemoveBranch}
            />

            {!isDefault ? (
              <BranchDecisionContent
                nodeId={nodeId}
                branch={branch}
                typeItems={typeItems}
                operatorOptionsByType={operatorOptionsByType}
                variableOptions={variableOptions}
                nodeOutputVariables={nodeOutputVariables}
                availableNodes={availableNodes}
                onConditionGroupOperatorToggle={handleConditionGroupOperatorToggle}
                onRemoveCondition={handleRemoveCondition}
                onConditionTypeChange={handleConditionTypeChange}
                onConditionFieldChange={handleConditionFieldChange}
                onConditionOperatorChange={handleConditionOperatorChange}
                onConditionVariableChange={handleConditionVariableChange}
                onAddCondition={handleAddCondition}
              />
            ) : (
              <div className="mt-4 rounded-lg border border-dashed border-[var(--border)] bg-background px-3 py-3 text-sm text-muted-foreground">
                {t('workflow.conditions.noConditionsFallback')}
              </div>
            )}
          </section>
        );
      })}
    </div>
  );
};