import { NodeData, ParameterType } from "../../types";

export type OperatorType =
  | 'string'
  | 'number'
  | 'boolean'
  | 'array'
  | 'object'
  | 'file'
  | 'datetime'
  | 'any';

export type LogicalOperator = 'and' | 'or';

export enum ConditionOperator {
  StringEquals = 'string:eq',
  StringNotEquals = 'string:not_eq',
  StringContains = 'string:contains',
  StringNotContains = 'string:not_contains',
  StringStartsWith = 'string:starts_with',
  StringEndsWith = 'string:ends_with',
  StringIsEmpty = 'string:is_empty',
  StringIsNotEmpty = 'string:is_not_empty',
  NumberEquals = 'number:eq',
  NumberNotEquals = 'number:not_eq',
  NumberGreaterThan = 'number:gt',
  NumberGreaterThanOrEqual = 'number:gte',
  NumberLessThan = 'number:lt',
  NumberLessThanOrEqual = 'number:lte',
  NumberIsEmpty = 'number:is_empty',
  NumberIsNotEmpty = 'number:is_not_empty',
  BooleanIsTrue = 'boolean:is_true',
  BooleanIsFalse = 'boolean:is_false',
  BooleanEquals = 'boolean:eq',
  BooleanNotEquals = 'boolean:not_eq',
  ArrayContains = 'array:contains',
  ArrayNotContains = 'array:not_contains',
  ArrayIsEmpty = 'array:is_empty',
  ArrayIsNotEmpty = 'array:is_not_empty',
  ObjectHasKey = 'object:has_key',
  ObjectNotHasKey = 'object:not_has_key',
  ObjectIsEmpty = 'object:is_empty',
  ObjectIsNotEmpty = 'object:is_not_empty',
  AnyEquals = 'any:eq',
  AnyNotEquals = 'any:not_eq',
  AnyIsEmpty = 'any:is_empty',
  AnyIsNotEmpty = 'any:is_not_empty',
  FileNameContains = 'file:name_contains',
  FileIsEmpty = 'file:is_empty',
  FileIsNotEmpty = 'file:is_not_empty',
}

export type ComparisonOperator = {
  firstType: OperatorType;
  operator: ConditionOperator;
  secondType?: OperatorType;
  singleValue?: boolean; // 是否为单值比较，如 "is empty"、"is not empty"
}

export type Condition = {
  id: string;
  leftValue: ParameterType | ParameterType[];
  operator: ComparisonOperator;
  rightValue: ParameterType | ParameterType[];
}

export type ConditionOption = {
  caseSensitive: boolean;
  strictness: 'strict' | 'loose';
}

export type ConditionGroup = {
  options: ConditionOption;
  conditions: Condition[];
  logicalOperator: LogicalOperator;
}

export type IfElseNodeData = NodeData & {
  condition?: string;
  operator?: ComparisonOperator;
  value?: any;
}
