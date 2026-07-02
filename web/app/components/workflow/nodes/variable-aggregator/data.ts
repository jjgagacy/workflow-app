import type { NodeDefaultData } from "../../types";
import type { VariableAggregatorItem, VariableAggregatorNodeData } from "./types";

const createId = (prefix: string) => `${prefix}:${Date.now()}:${Math.random().toString(36).slice(2, 8)}`;

export const DEFAULT_AGGREGATOR_OUTPUT_NAME = 'result';

export const createVariableAggregatorItem = (): VariableAggregatorItem => ({
  id: createId('variable-aggregator-item'),
  valueSource: 'input',
});

export const variableAggregatorNodeDefaultData: NodeDefaultData<VariableAggregatorNodeData> = {
  value: {
    variables: [createVariableAggregatorItem()],
    outputName: DEFAULT_AGGREGATOR_OUTPUT_NAME,
  },
};
