import type { NodeDefaultData } from "../../types";
import type { ListOperatorCondition, ListOperatorNodeData } from "./types";

const createId = (prefix: string) => `${prefix}:${Date.now()}:${Math.random().toString(36).slice(2, 8)}`;

export const DEFAULT_LIST_OPERATOR_OUTPUT_VARIABLE_NAME = 'result';

export const createListOperatorCondition = (): ListOperatorCondition => ({
  id: createId('list-operator-condition'),
  operator: 'contains',
  value: '',
});

export const normalizeListOperatorConditions = (conditions?: ListOperatorCondition[]) => {
  const list = (conditions ?? []).filter(Boolean);
  if (!list.length) {
    return [createListOperatorCondition()];
  }

  return list;
};

export const listOperatorNodeDefaultData: NodeDefaultData<ListOperatorNodeData> = {
  value: {
    logicalOperator: 'and',
    conditions: normalizeListOperatorConditions(),
    firstN: 0,
    lastN: 0,
    enableSort: false,
    sortOrder: 'asc',
    outputVariableName: DEFAULT_LIST_OPERATOR_OUTPUT_VARIABLE_NAME,
  },
  validate: function (payload: ListOperatorNodeData, t: any, data?: any): { valid: boolean; errorMessage?: string; } {
    if (!payload.inputVariable?.nodeId || !payload.inputVariable?.path?.length) {
      return { valid: false, errorMessage: t('workflow.checkList.error.listOperatorInputVariableMissing') };
    }

    if (!payload.outputVariableName?.trim()) {
      return { valid: false, errorMessage: t('workflow.checkList.error.listOperatorOutputVariableMissing') };
    }

    return { valid: true };
  }
};
