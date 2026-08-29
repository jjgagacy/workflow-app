import type { NodeDefaultData } from "../../types";
import { DEFAULT_OUTPUT_VARIABLE_NAME } from "../document-extractor/data";
import type { VariableAggregatorItem, VariableAggregatorNodeData } from "./types";

const createId = (prefix: string) => `${prefix}:${Date.now()}:${Math.random().toString(36).slice(2, 8)}`;

export const DEFAULT_AGGREGATOR_OUTPUT_NAME = DEFAULT_OUTPUT_VARIABLE_NAME;

export const createVariableAggregatorItem = (): VariableAggregatorItem => ({
  id: createId('variable-aggregator-item'),
  valueSource: undefined,
});

const isSameVariableSelector = (left?: VariableAggregatorItem['valueSource'], right?: VariableAggregatorItem['valueSource']) => {
  if (!left || !right) {
    return false;
  }

  return left.nodeId === right.nodeId
    && left.path.length === right.path.length
    && left.path.every((item, index) => item === right.path[index]);
};

export const variableAggregatorNodeDefaultData: NodeDefaultData<VariableAggregatorNodeData> = {
  value: {
    variables: [createVariableAggregatorItem()],
    outputName: DEFAULT_AGGREGATOR_OUTPUT_NAME,
  },
  validate: function (payload: VariableAggregatorNodeData, t: any, data?: any): { valid: boolean; errorMessage?: string; } {
    const variables = payload.variables ?? [];
    if (variables.length === 0) {
      return { valid: false, errorMessage: t('workflow.checkList.error.variableAggregatorVariableMissing') };
    }

    for (let index = 0; index < variables.length; index += 1) {
      const item = variables[index];
      if (!item.valueSource?.nodeId || !item.valueSource?.path?.length) {
        return {
          valid: false,
          errorMessage: t('workflow.checkList.error.variableAggregatorVariableSelectorMissing', { index: index + 1 }),
        };
      }

      const hasDuplicate = variables.some((candidate, candidateIndex) => {
        if (candidateIndex === index) {
          return false;
        }

        return isSameVariableSelector(candidate.valueSource, item.valueSource);
      });

      if (hasDuplicate) {
        return {
          valid: false,
          errorMessage: t('workflow.checkList.error.variableAggregatorDuplicateVariable', { index: index + 1 }),
        };
      }
    }

    if (!payload.outputName?.trim()) {
      return { valid: false, errorMessage: t('workflow.checkList.error.variableAggregatorOutputNameMissing') };
    }

    return { valid: true };
  }
};
