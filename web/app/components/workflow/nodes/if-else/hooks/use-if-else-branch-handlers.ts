import { Draft, produce } from "immer";
import { useNodesUpdate } from "../../../hooks/use-nodesUpdate";
import { useWorkflowStore } from "../../../context";
import {
  createIfElseBranch,
  createIfElseCondition,
  getIfElseBranchDefaultName,
  normalizeIfElseBranches,
} from "../data";
import {
  Condition,
  ConditionBranch,
  ConditionOperator,
  IfElseNodeData,
  LogicalOperator,
  OperatorType,
} from "../types";
import { Node } from "../../../types";
import { useIfElseOperatorOptions } from "./use-if-else-operator-options";

type UseIfElseBranchHandlersProps = {
  node: Node<IfElseNodeData>;
  branches: ConditionBranch[];
};

export const useIfElseBranchHandlers = ({ node, branches }: UseIfElseBranchHandlersProps) => {
  const updateActivePanelNode = useWorkflowStore((state) => state.updateActivePanelNode);
  const { onNodeDataUpdate } = useNodesUpdate();
  const { operatorOptionsByType } = useIfElseOperatorOptions();

  const syncBranches = (nextBranches: ConditionBranch[]) => {
    const normalizedBranches = normalizeIfElseBranches(nextBranches);
    const nextNode = {
      ...node,
      data: {
        ...node.data,
        branches: normalizedBranches,
      },
    };

    updateActivePanelNode(nextNode);
    onNodeDataUpdate({
      id: node.id,
      data: {
        branches: normalizedBranches,
      },
    });
  };

  const updateBranch = (branchId: string, updater: (branch: ConditionBranch) => ConditionBranch) => {
    syncBranches(
      branches.map((branch) => {
        if (branch.id !== branchId) {
          return branch;
        }

        return updater(branch);
      }),
    );
  };

  const handleAddBranch = () => {
    const elseBranch = branches.find((branch) => branch.isDefault);
    const decisionBranches = branches.filter((branch) => !branch.isDefault);

    syncBranches([
      ...decisionBranches,
      createIfElseBranch(),
      ...(elseBranch ? [elseBranch] : []),
    ]);
  };

  const handleRemoveBranch = (branchId: string) => {
    syncBranches(branches.filter((branch) => branch.id !== branchId));
  };

  const handleMoveBranch = (branchId: string, direction: "up" | "down") => {
    const elseBranch = branches.find((branch) => branch.isDefault);
    const decisionBranches = branches.filter((branch) => !branch.isDefault);
    const currentIndex = decisionBranches.findIndex((branch) => branch.id === branchId);

    if (currentIndex === -1) {
      return;
    }

    const targetIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;

    if (targetIndex < 0 || targetIndex >= decisionBranches.length) {
      return;
    }

    const nextDecisionBranches = [...decisionBranches];
    const [movedBranch] = nextDecisionBranches.splice(currentIndex, 1);
    nextDecisionBranches.splice(targetIndex, 0, movedBranch);

    syncBranches([
      ...nextDecisionBranches,
      ...(elseBranch ? [elseBranch] : []),
    ]);
  };

  const handleBranchLogicalOperatorChange = (branchId: string, value: LogicalOperator) => {
    updateBranch(branchId, (branch) => ({
      ...branch,
      logicalOperator: value,
      conditionGroup: {
        ...branch.conditionGroup,
        logicalOperator: value,
      },
    }));
  };

  const handleBranchNameChange = (branchId: string, value: string, branchIndex: number, isDefault?: boolean) => {
    updateBranch(branchId, (branch) => ({
      ...branch,
      name: value || getIfElseBranchDefaultName(branchIndex, isDefault),
    }));
  };

  const handleConditionGroupOperatorToggle = (branchId: string, currentValue: LogicalOperator) => {
    handleBranchLogicalOperatorChange(branchId, currentValue === 'and' ? 'or' : 'and');
  };

  const handleAddCondition = (branchId: string) => {
    updateBranch(branchId, (branch) => ({
      ...branch,
      conditionGroup: {
        ...branch.conditionGroup,
        conditions: [...(branch.conditionGroup.conditions ?? []), createIfElseCondition()],
      },
    }));
  };

  const handleRemoveCondition = (branchId: string, conditionId: string) => {
    updateBranch(branchId, (branch) => ({
      ...branch,
      conditionGroup: {
        ...branch.conditionGroup,
        conditions: branch.conditionGroup.conditions.filter((condition) => condition.id !== conditionId),
      },
    }));
  };

  const updateCondition = (branchId: string, conditionId: string, updater: (condition: Draft<Condition>) => void) => {
    updateBranch(branchId, (branch) => ({
      ...branch,
      conditionGroup: {
        ...branch.conditionGroup,
        conditions: branch.conditionGroup.conditions.map((condition) => {
          if (condition.id !== conditionId) {
            return condition;
          }

          return produce(condition, updater);
        }),
      },
    }));
  };

  const handleConditionTypeChange = (branchId: string, conditionId: string, value: OperatorType) => {
    const nextOperator = operatorOptionsByType[value]?.[0];

    if (!nextOperator) {
      return;
    }

    updateCondition(branchId, conditionId, (condition) => {
      condition.operator.leftType = value;
      condition.operator.operator = nextOperator.value;
      condition.operator.rightType = nextOperator.isUnary ? undefined : value;
      condition.operator.isUnary = nextOperator.isUnary;
      condition.rightValue = nextOperator.isUnary ? undefined : condition.rightValue;
    });
  };

  const handleConditionOperatorChange = (branchId: string, conditionId: string, value: ConditionOperator) => {
    updateCondition(branchId, conditionId, (condition) => {
      const currentType = (condition.operator.leftType ?? 'string') as OperatorType;
      const nextOperator = operatorOptionsByType[currentType]?.find((operator) => operator.value === value);

      condition.operator.operator = value;
      condition.operator.rightType = nextOperator?.isUnary ? undefined : currentType;
      condition.operator.isUnary = nextOperator?.isUnary;
      condition.rightValue = nextOperator?.isUnary ? undefined : condition.rightValue;
    });
  };

  const handleConditionFieldChange = (branchId: string, conditionId: string, key: 'leftValue' | 'rightValue', value: string) => {
    updateCondition(branchId, conditionId, (condition) => {
      condition[key] = value;
    });
  };

  return {
    handleAddBranch,
    handleRemoveBranch,
    handleMoveBranch,
    handleBranchLogicalOperatorChange,
    handleBranchNameChange,
    handleConditionGroupOperatorToggle,
    handleAddCondition,
    handleRemoveCondition,
    handleConditionTypeChange,
    handleConditionOperatorChange,
    handleConditionFieldChange,
  };
};