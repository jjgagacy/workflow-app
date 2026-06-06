import type { NodeData } from "../../types";

export type KnowledgeBaseSelection = {
  id: string;
  knowledgeBaseId: string;
};

export type KnowledgeRetrievalNodeData = NodeData<{
  inputVariable?: string;
  knowledgeBases?: KnowledgeBaseSelection[];
  outputVariableName?: string;
}>;
