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

  return {
    operatorOptionsByType,
  };
};