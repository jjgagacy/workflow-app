import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Operator, OperatorGroup } from "../types";
import { ConditionOperator } from "../nodes/if-else/types";

type OperatorGroupLabel = OperatorGroup['label'];

type OperatorDefinition = Omit<Operator, 'name'>;

type OperatorGroupDefinition = Omit<OperatorGroup, 'operators'> & {
  operators: OperatorDefinition[];
};

const operatorGroupDefinitions: OperatorGroupDefinition[] = [
  {
    id: 'string',
    label: 'string',
    operators: [
      { leftType: 'string', operator: ConditionOperator.StringEquals },
      { leftType: 'string', operator: ConditionOperator.StringNotEquals },
      { leftType: 'string', operator: ConditionOperator.StringContains },
      { leftType: 'string', operator: ConditionOperator.StringNotContains },
      { leftType: 'string', operator: ConditionOperator.StringStartsWith },
      { leftType: 'string', operator: ConditionOperator.StringEndsWith },
      { leftType: 'string', operator: ConditionOperator.StringIsEmpty, isUnary: true },
      { leftType: 'string', operator: ConditionOperator.StringIsNotEmpty, isUnary: true },
    ],
  },
  {
    id: 'number',
    label: 'number',
    operators: [
      { leftType: 'number', operator: ConditionOperator.NumberEquals },
      { leftType: 'number', operator: ConditionOperator.NumberNotEquals },
      { leftType: 'number', operator: ConditionOperator.NumberGreaterThan },
      { leftType: 'number', operator: ConditionOperator.NumberGreaterThanOrEqual },
      { leftType: 'number', operator: ConditionOperator.NumberLessThan },
      { leftType: 'number', operator: ConditionOperator.NumberLessThanOrEqual },
      { leftType: 'number', operator: ConditionOperator.NumberIsEmpty, isUnary: true },
      { leftType: 'number', operator: ConditionOperator.NumberIsNotEmpty, isUnary: true },
    ],
  },
  {
    id: 'boolean',
    label: 'boolean',
    operators: [
      { leftType: 'boolean', operator: ConditionOperator.BooleanIsTrue, isUnary: true },
      { leftType: 'boolean', operator: ConditionOperator.BooleanIsFalse, isUnary: true },
      { leftType: 'boolean', operator: ConditionOperator.BooleanEquals },
      { leftType: 'boolean', operator: ConditionOperator.BooleanNotEquals },
    ],
  },
  {
    id: 'array',
    label: 'array',
    operators: [
      { leftType: 'array', operator: ConditionOperator.ArrayContains },
      { leftType: 'array', operator: ConditionOperator.ArrayNotContains },
      { leftType: 'array', operator: ConditionOperator.ArrayIsEmpty, isUnary: true },
      { leftType: 'array', operator: ConditionOperator.ArrayIsNotEmpty, isUnary: true },
    ],
  },
  {
    id: 'object',
    label: 'object',
    operators: [
      { leftType: 'object', operator: ConditionOperator.ObjectHasKey },
      { leftType: 'object', operator: ConditionOperator.ObjectNotHasKey },
      { leftType: 'object', operator: ConditionOperator.ObjectIsEmpty, isUnary: true },
      { leftType: 'object', operator: ConditionOperator.ObjectIsNotEmpty, isUnary: true },
    ],
  },
  {
    id: 'any',
    label: 'any',
    operators: [
      { leftType: 'any', operator: ConditionOperator.AnyEquals },
      { leftType: 'any', operator: ConditionOperator.AnyNotEquals },
      { leftType: 'any', operator: ConditionOperator.AnyIsEmpty, isUnary: true },
      { leftType: 'any', operator: ConditionOperator.AnyIsNotEmpty, isUnary: true },
    ],
  },
  {
    id: 'file',
    label: 'file',
    operators: [
      { leftType: 'file', operator: ConditionOperator.FileNameContains },
      { leftType: 'file', operator: ConditionOperator.FileIsEmpty, isUnary: true },
      { leftType: 'file', operator: ConditionOperator.FileIsNotEmpty, isUnary: true },
    ],
  },
];

const getOperatorTranslationKey = (operator: ConditionOperator) => {
  return operator.replace(':', ' ');
};

export const useOperators = () => {
  const { t } = useTranslation();

  const operatorGroups = useMemo<OperatorGroup[]>(() => {
    return operatorGroupDefinitions.map(group => ({
      ...group,
      operators: group.operators.map(operator => ({
        ...operator,
        name: t(`workflow.operator.${getOperatorTranslationKey(operator.operator)}`),
      })),
    }));
  }, [t]);

  const getOperatorGroup = (type: OperatorGroupLabel) => {
    return operatorGroups.find(group => group.label === type);
  };

  const getOperators = (type: OperatorGroupLabel): Operator[] => {
    return getOperatorGroup(type)?.operators ?? [];
  };

  return {
    operatorGroups,
    getOperatorGroup,
    getOperators,
  };
}