import { Draft, produce } from "immer";
import { useNodesUpdate } from "../../../hooks/use-nodesUpdate";
import { useWorkflowStore } from "../../../context";
import { createIfElseCondition } from "../../if-else/data";
import type {
  Condition,
  ConditionOperator,
  LogicalOperator,
  OperatorType,
} from "../../if-else/types";
import type { Node } from "../../../types";
import type { FilterNodeData } from "../types";
import { useIfElseOperatorOptions } from "../../if-else/hooks";
import { normalizeFilterBranches } from "../data";

type UseFilterConditionHandlersProps = {
  node: Node<FilterNodeData>;
};

export const useFilterConditionHandlers = ({ node }: UseFilterConditionHandlersProps) => {
  const updateActivePanelNode = useWorkflowStore((state) => state.updateActivePanelNode);
  const { onNodeDataUpdate } = useNodesUpdate();
  const { operatorOptionsByType } = useIfElseOperatorOptions();
  const [branch] = normalizeFilterBranches(node.data.branches);

  const syncBranch = (nextBranch: typeof branch) => {
    const normalizedBranches = normalizeFilterBranches([nextBranch]);
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

  const updateConditionGroup = (updater: (currentBranch: typeof branch) => typeof branch) => {
    syncBranch(updater(branch));
  };

  const handleConditionGroupOperatorToggle = (currentValue: LogicalOperator) => {
    updateConditionGroup((currentBranch) => ({
      ...currentBranch,
      logicalOperator: currentValue === 'and' ? 'or' : 'and',
      conditionGroup: {
        ...currentBranch.conditionGroup,
        logicalOperator: currentValue === 'and' ? 'or' : 'and',
      },
    }));
  };

  const handleAddCondition = () => {
    updateConditionGroup((currentBranch) => ({
      ...currentBranch,
      conditionGroup: {
        ...currentBranch.conditionGroup,
        conditions: [...(currentBranch.conditionGroup.conditions ?? []), createIfElseCondition()],
      },
    }));
  };

  const handleRemoveCondition = (conditionId: string) => {
    updateConditionGroup((currentBranch) => ({
      ...currentBranch,
      conditionGroup: {
        ...currentBranch.conditionGroup,
        conditions: currentBranch.conditionGroup.conditions.filter((condition) => condition.id !== conditionId),
      },
    }));
  };

  const updateCondition = (conditionId: string, updater: (condition: Draft<Condition>) => void) => {
    updateConditionGroup((currentBranch) => ({
      ...currentBranch,
      conditionGroup: {
        ...currentBranch.conditionGroup,
        conditions: currentBranch.conditionGroup.conditions.map((condition) => {
          if (condition.id !== conditionId) {
            return condition;
          }

          return produce(condition, updater);
        }),
      },
    }));
  };

  const handleConditionTypeChange = (conditionId: string, value: OperatorType) => {
    const nextOperator = operatorOptionsByType[value]?.[0];

    if (!nextOperator) {
      return;
    }

    updateCondition(conditionId, (condition) => {
      condition.operator.leftType = value;
      condition.operator.operator = nextOperator.value;
      condition.operator.rightType = nextOperator.isUnary ? undefined : value;
      condition.operator.isUnary = nextOperator.isUnary;
      condition.rightValue = nextOperator.isUnary ? undefined : condition.rightValue;
    });
  };

  const handleConditionOperatorChange = (conditionId: string, value: ConditionOperator) => {
    updateCondition(conditionId, (condition) => {
      const currentType = (condition.operator.leftType ?? 'string') as OperatorType;
      const nextOperator = operatorOptionsByType[currentType]?.find((operator) => operator.value === value);

      condition.operator.operator = value;
      condition.operator.rightType = nextOperator?.isUnary ? undefined : currentType;
      condition.operator.isUnary = nextOperator?.isUnary;
      condition.rightValue = nextOperator?.isUnary ? undefined : condition.rightValue;
    });
  };

  const handleConditionFieldChange = (conditionId: string, key: 'leftValue' | 'rightValue', value: string) => {
    updateCondition(conditionId, (condition) => {
      condition[key] = value;
    });
  };

  return {
    branch,
    operatorOptionsByType,
    handleConditionGroupOperatorToggle,
    handleAddCondition,
    handleRemoveCondition,
    handleConditionTypeChange,
    handleConditionOperatorChange,
    handleConditionFieldChange,
  };
};