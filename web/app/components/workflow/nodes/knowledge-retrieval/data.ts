import type { NodeDefaultData } from "../../types";
import type { KnowledgeBaseSelection, KnowledgeRetrievalNodeData } from "./types";

const createId = (prefix: string) => `${prefix}:${Date.now()}:${Math.random().toString(36).slice(2, 8)}`;

export const KNOWLEDGE_OUTPUT_VARIABLE_NAME = 'text';

export const knowledgeRetrievalNodeDefaultData: NodeDefaultData<KnowledgeRetrievalNodeData> = {
  value: {
    inputVariable: 'input',
    knowledgeBases: [],
    outputVariableName: KNOWLEDGE_OUTPUT_VARIABLE_NAME,
  },
};
