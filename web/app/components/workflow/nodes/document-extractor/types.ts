import type { NodeData, VariableSelector } from "../../types";

export type DocumentExtractorNodeData = NodeData<{
  inputVariable?: VariableSelector;
  outputVariableName?: string;
  isArrayFile?: boolean;
}>;
