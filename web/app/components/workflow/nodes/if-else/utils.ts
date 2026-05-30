import { getIfElseBranchDefaultName } from "./data";
import { OperatorType, ConditionBranch } from "./types";

export const readOperatorType = (operator: Record<string, any>) => {
  return (operator.leftType ?? operator.firstType ?? 'string') as OperatorType;
};

export const readOperatorUnary = (operator: Record<string, any>) => {
  return Boolean(operator.isUnary ?? operator.singleValue);
};

export const getBranchTitle = (branch: ConditionBranch, index: number) => {
  return branch.name?.trim() || getIfElseBranchDefaultName(index, branch.isDefault);
};

