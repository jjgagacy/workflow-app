import type { NodeDefaultData } from "../../types";
import type { KnowledgeBaseSelection, KnowledgeRetrievalNodeData } from "./types";

const createId = (prefix: string) => `${prefix}:${Date.now()}:${Math.random().toString(36).slice(2, 8)}`;

export const KNOWLEDGE_OUTPUT_VARIABLE_NAME = 'text';

export const knowledgeRetrievalNodeDefaultData: NodeDefaultData<KnowledgeRetrievalNodeData> = {
  value: {
    knowledgeBases: [],
    outputVariableName: KNOWLEDGE_OUTPUT_VARIABLE_NAME,
  },
  validate: function (payload: KnowledgeRetrievalNodeData, t: any, data?: any): { valid: boolean; errorMessage?: string; } {
    if (!payload.inputVariable?.nodeId || !payload.inputVariable?.path?.length) {
      return { valid: false, errorMessage: t('workflow.checkList.error.knowledgeRetrievalInputVariableMissing') };
    }

    if (!payload.outputVariableName?.trim()) {
      return { valid: false, errorMessage: t('workflow.checkList.error.knowledgeRetrievalOutputVariableMissing') };
    }

    if (!payload.knowledgeBases?.length) {
      return { valid: false, errorMessage: t('workflow.checkList.error.knowledgeRetrievalKnowledgeBaseMissing') };
    }

    return { valid: true };
  }
};
