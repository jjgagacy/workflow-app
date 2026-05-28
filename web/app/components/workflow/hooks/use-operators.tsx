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
      { firstType: 'string', operator: ConditionOperator.StringEquals },
      { firstType: 'string', operator: ConditionOperator.StringNotEquals },
      { firstType: 'string', operator: ConditionOperator.StringContains },
      { firstType: 'string', operator: ConditionOperator.StringNotContains },
      { firstType: 'string', operator: ConditionOperator.StringStartsWith },
      { firstType: 'string', operator: ConditionOperator.StringEndsWith },
      { firstType: 'string', operator: ConditionOperator.StringIsEmpty, singleValue: true },
      { firstType: 'string', operator: ConditionOperator.StringIsNotEmpty, singleValue: true },
    ],
  },
  {
    id: 'number',
    label: 'number',
    operators: [
      { firstType: 'number', operator: ConditionOperator.NumberEquals },
      { firstType: 'number', operator: ConditionOperator.NumberNotEquals },
      { firstType: 'number', operator: ConditionOperator.NumberGreaterThan },
      { firstType: 'number', operator: ConditionOperator.NumberGreaterThanOrEqual },
      { firstType: 'number', operator: ConditionOperator.NumberLessThan },
      { firstType: 'number', operator: ConditionOperator.NumberLessThanOrEqual },
      { firstType: 'number', operator: ConditionOperator.NumberIsEmpty, singleValue: true },
      { firstType: 'number', operator: ConditionOperator.NumberIsNotEmpty, singleValue: true },
    ],
  },
  {
    id: 'boolean',
    label: 'boolean',
    operators: [
      { firstType: 'boolean', operator: ConditionOperator.BooleanIsTrue, singleValue: true },
      { firstType: 'boolean', operator: ConditionOperator.BooleanIsFalse, singleValue: true },
      { firstType: 'boolean', operator: ConditionOperator.BooleanEquals },
      { firstType: 'boolean', operator: ConditionOperator.BooleanNotEquals },
    ],
  },
  {
    id: 'array',
    label: 'array',
    operators: [
      { firstType: 'array', operator: ConditionOperator.ArrayContains },
      { firstType: 'array', operator: ConditionOperator.ArrayNotContains },
      { firstType: 'array', operator: ConditionOperator.ArrayIsEmpty, singleValue: true },
      { firstType: 'array', operator: ConditionOperator.ArrayIsNotEmpty, singleValue: true },
    ],
  },
  {
    id: 'object',
    label: 'object',
    operators: [
      { firstType: 'object', operator: ConditionOperator.ObjectHasKey },
      { firstType: 'object', operator: ConditionOperator.ObjectNotHasKey },
      { firstType: 'object', operator: ConditionOperator.ObjectIsEmpty, singleValue: true },
      { firstType: 'object', operator: ConditionOperator.ObjectIsNotEmpty, singleValue: true },
    ],
  },
  {
    id: 'any',
    label: 'any',
    operators: [
      { firstType: 'any', operator: ConditionOperator.AnyEquals },
      { firstType: 'any', operator: ConditionOperator.AnyNotEquals },
      { firstType: 'any', operator: ConditionOperator.AnyIsEmpty, singleValue: true },
      { firstType: 'any', operator: ConditionOperator.AnyIsNotEmpty, singleValue: true },
    ],
  },
  {
    id: 'file',
    label: 'file',
    operators: [
      { firstType: 'file', operator: ConditionOperator.FileNameContains },
      { firstType: 'file', operator: ConditionOperator.FileIsEmpty, singleValue: true },
      { firstType: 'file', operator: ConditionOperator.FileIsNotEmpty, singleValue: true },
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