import type { NodeDefaultData } from "../../types";
import type { ListOperatorCondition, ListOperatorNodeData } from "./types";

const createId = (prefix: string) => `${prefix}:${Date.now()}:${Math.random().toString(36).slice(2, 8)}`;

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
    inputVariable: '',
    logicalOperator: 'and',
    conditions: normalizeListOperatorConditions(),
    firstN: 0,
    lastN: 0,
    enableSort: false,
    sortOrder: 'asc',
    outputVariableName: 'listResult',
  },
};
