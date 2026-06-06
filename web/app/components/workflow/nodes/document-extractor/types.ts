import type { NodeData } from "../../types";

export type DocumentExtractorNodeData = NodeData<{
  inputVariable?: string;
  outputVariableName?: string;
}>;
