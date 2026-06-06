import type { NodeData, VariableType } from "../../types";

export type ParameterExtractorItem = {
  id: string;
  name: string;
  type: VariableType;
  description: string;
};

export type ParameterExtractorNodeData = NodeData<{
  modelId?: string;
  inputVariable?: string;
  enableVision?: boolean;
  parameters?: ParameterExtractorItem[];
  outputVariableName?: string;
}>;
