import type { NodeData, VariableSelector } from "../../types";

export type VariableAggregatorItem = {
  id: string;
  valueSource?: VariableSelector;
};

export type VariableAggregatorNodeData = NodeData<{
  variables?: VariableAggregatorItem[];
  outputName?: string;
}>;
