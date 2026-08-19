import { useTranslation } from "react-i18next";
import { useIfElseOperatorOptions } from "../if-else/hooks";
import { Node } from "../../types";
import { useFilterConditionHandlers } from "./hooks/use-filter-condition-handlers";
import type { FilterNodeData } from "./types";
import { useNodeConfig } from "../../hooks/use-node-config";
import BranchLogicInfo from "../../components/branch/branch-logic-info";
import { BranchDecisionContent } from "../../components/branch/branch-decision-content";

type FilterPanelProps = {
  node: Node<FilterNodeData>;
};

const FilterPanel = ({ node }: FilterPanelProps) => {
  const { t } = useTranslation();
  const { operatorOptionsByType, typeItems } = useIfElseOperatorOptions();
  const { variableOptions, nodeVariableList, availableNodes } = useNodeConfig(node.id);
  const {
    branch,
    handleConditionGroupOperatorToggle,
    handleAddCondition,
    handleRemoveCondition,
    handleConditionTypeChange,
    handleConditionOperatorChange,
    handleConditionFieldChange,
  } = useFilterConditionHandlers({ node });

  return (
    <div className="space-y-0">
      <BranchLogicInfo
        decisionBranchCount={1}
        resolvedOutputHandleCount={1}
        title={t('workflow.nodes.filter.name')}
        description={t('workflow.nodes.filter.description')}
      />

      <section className="rounded-xl bg-transparent px-1 py-2">
        <div className="group relative flex items-center gap-3 rounded-lg border border-transparent bg-muted/10 px-2 py-1.5 transition-colors hover:border-muted/30 hover:bg-muted/20">
          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-muted bg-background text-[10px] font-medium text-muted-foreground">
            1
          </div>
          <div className="min-w-0 flex-1 text-sm font-medium text-foreground">
            {node.data.label?.trim() || t('workflow.nodes.filter.name')}
          </div>
          <span className="shrink-0 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
            {branch.conditionGroup.logicalOperator.toUpperCase()}
          </span>
        </div>

        <BranchDecisionContent
          nodeId={node.id}
          branch={branch}
          typeItems={typeItems}
          operatorOptionsByType={operatorOptionsByType}
          variableOptions={variableOptions}
          nodeOutputVariables={nodeVariableList}
          availableNodes={availableNodes}
          onConditionGroupOperatorToggle={(branchId, currentValue) => {
            void branchId;
            handleConditionGroupOperatorToggle(currentValue);
          }}
          onRemoveCondition={(branchId, conditionId) => {
            void branchId;
            handleRemoveCondition(conditionId);
          }}
          onConditionTypeChange={(branchId, conditionId, value) => {
            void branchId;
            handleConditionTypeChange(conditionId, value);
          }}
          onConditionFieldChange={(branchId, conditionId, key, value) => {
            void branchId;
            handleConditionFieldChange(conditionId, key, value);
          }}
          onConditionOperatorChange={(branchId, conditionId, value) => {
            void branchId;
            handleConditionOperatorChange(conditionId, value);
          }}
          onAddCondition={(branchId) => {
            void branchId;
            handleAddCondition();
          }}
        />
      </section>
    </div>
  );
};

export default FilterPanel;