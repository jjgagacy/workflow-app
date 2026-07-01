import type { OperatorOption } from "../hooks/use-if-else-operator-options";
import type { ConditionBranch, ConditionOperator, OperatorType } from "../types";

export type VariableOption = {
  label: string;
  value: string;
  group: string;
  description?: string;
};

export type SelectItem = {
  value: string;
  name: string;
  description?: string;
  group?: string;
};

export type IfElseBranchListProps = {
  branches: ConditionBranch[];
  decisionBranchCount: number;
  operatorOptionsByType: Record<OperatorType, OperatorOption[]>;
  typeItems: SelectItem[];
  variableOptions: VariableOption[];
  variableOptionGroups: Record<string, VariableOption[]>;
  handleBranchNameChange: (branchId: string, value: string, branchIndex: number, isDefault?: boolean) => void;
  handleMoveBranch: (branchId: string, direction: "up" | "down") => void;
  handleRemoveBranch: (branchId: string) => void;
  handleConditionGroupOperatorToggle: (branchId: string, currentValue: ConditionBranch["conditionGroup"]["logicalOperator"]) => void;
  handleRemoveCondition: (branchId: string, conditionId: string) => void;
  handleConditionTypeChange: (branchId: string, conditionId: string, value: OperatorType) => void;
  handleConditionFieldChange: (branchId: string, conditionId: string, key: "leftValue" | "rightValue", value: string) => void;
  handleConditionOperatorChange: (branchId: string, conditionId: string, value: ConditionOperator) => void;
  handleAddCondition: (branchId: string) => void;
};
