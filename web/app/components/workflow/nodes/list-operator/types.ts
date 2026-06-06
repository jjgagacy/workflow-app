import type { NodeData } from "../../types";

export type ListOperatorLogicalOperator = 'and' | 'or';

export type ListStringConditionOperator =
  | 'contains'
  | 'not_contains'
  | 'equals'
  | 'not_equals'
  | 'starts_with'
  | 'ends_with'
  | 'is_empty'
  | 'is_not_empty';

export type ListOperatorCondition = {
  id: string;
  operator: ListStringConditionOperator;
  value: string;
};

export type ListOperatorNodeData = NodeData<{
  inputVariable?: string;
  logicalOperator?: ListOperatorLogicalOperator;
  conditions?: ListOperatorCondition[];
  firstN?: number;
  lastN?: number;
  enableSort?: boolean;
  sortOrder?: 'asc' | 'desc';
  outputVariableName?: string;
}>;
