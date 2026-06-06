import type { NodeDefaultData } from "../../types";
import type { VariableAggregatorItem, VariableAggregatorNodeData } from "./types";

const createId = (prefix: string) => `${prefix}:${Date.now()}:${Math.random().toString(36).slice(2, 8)}`;

export const createVariableAggregatorItem = (): VariableAggregatorItem => ({
  id: createId('variable-aggregator-item'),
  valueSource: 'input',
});

export const variableAggregatorNodeDefaultData: NodeDefaultData<VariableAggregatorNodeData> = {
  value: {
    variables: [createVariableAggregatorItem()],
    outputName: 'aggregated',
  },
};
