import type { NodeData } from "../../types";

export type VariableAggregatorItem = {
  id: string;
  valueSource: string;
};

export type VariableAggregatorNodeData = NodeData<{
  variables?: VariableAggregatorItem[];
  outputName?: string;
}>;
