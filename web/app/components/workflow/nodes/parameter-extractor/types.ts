import type { NodeData, VariableDataType } from "../../types";

export type ParameterExtractorItem = {
  id: string;
  name: string;
  type: VariableDataType;
  description: string;
};

export type ParameterExtractorNodeData = NodeData<{
  modelId?: string;
  inputVariable?: string;
  enableVision?: boolean;
  parameters?: ParameterExtractorItem[];
  outputVariableName?: string;
}>;
