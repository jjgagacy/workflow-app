import { useMemo } from "react";
import { ConditionOperator, OperatorType } from "../types";
import { readOperatorType, readOperatorUnary } from "../utils";
import { useOperators } from "../../../hooks/use-operators";

export type OperatorOption = {
  label: string;
  value: ConditionOperator;
  type: OperatorType;
  isUnary: boolean;
};

export type OperatorTypeItem = {
  value: OperatorType;
  name: string;
};

const toDisplayLabel = (value: string) => value.charAt(0).toUpperCase() + value.slice(1);

export const useIfElseOperatorOptions = () => {
  const { operatorGroups } = useOperators();

  const operatorOptionsByType = useMemo<Record<OperatorType, OperatorOption[]>>(() => {
    return operatorGroups.reduce((accumulator, group) => {
      accumulator[group.label] = group.operators.map((operator) => {
        const operatorRecord = operator as unknown as Record<string, any>;
        return {
          label: operator.name,
          value: operator.operator,
          type: readOperatorType(operatorRecord),
          isUnary: readOperatorUnary(operatorRecord),
        };
      });
      return accumulator;
    }, {} as Record<OperatorType, OperatorOption[]>);
  }, [operatorGroups]);

  // operatorOptionsByType: { string: [{ label: '等于', value: 'string:eq', type: 'string', isUnary: false }, ...], number: [...], boolean: [...], object: [...], any: [...], file: [...]  }

  const typeItems = useMemo<OperatorTypeItem[]>(() => {
    return (Object.keys(operatorOptionsByType) as OperatorType[]).map((option) => ({
      value: option,
      name: toDisplayLabel(option),
    }));
  }, [operatorOptionsByType]);

  // typeItems: [{ value: 'string', name: 'String' }, { value: 'number', name: 'Number' }, { value: 'boolean', name: 'Boolean' }, { value: 'object', name: 'Object' }, { value: 'any', name: 'Any' }, { value: 'file', name: 'File' }]

  return {
    operatorOptionsByType,
    typeItems,
  };
};