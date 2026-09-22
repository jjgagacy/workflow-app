import type { NodeData, VariableDataType, VariableSelector } from "../../types";

export type ParameterExtractorItem = {
  id: string;
  name: string;
  type: VariableDataType;
  description: string;
};

export type ParameterExtractorNodeData = NodeData<{
  modelId?: string;
  provider?: string;
  inputVariable?: VariableSelector;
  enableVision?: boolean;
  parameters?: ParameterExtractorItem[];
  outputVariableName?: string;
}>;
