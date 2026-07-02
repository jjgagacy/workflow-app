import type { NodeData } from "../../types";

export type KnowledgeBaseOption = {
  id: string;
  name: string;
  description?: string;
};

export type KnowledgeBaseSelection = {
  id: string;
  knowledgeBaseId: string;
};

export type KnowledgeRetrievalNodeData = NodeData<{
  inputVariable?: string;
  knowledgeBases?: KnowledgeBaseSelection[];
  outputVariableName?: string;
}>;
