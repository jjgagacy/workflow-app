import type { NodeDefaultData } from "../../types";
import { WORKFLOW_MODEL_DEFAULT_ID } from "../../components/nodes-shared/model-options";
import type { LLMNodeData } from "./types";

export const LLM_DEFAULT_EXCEPTION_STRATEGY = 'stop-execution';

export const llmNodeDefaultData: NodeDefaultData<LLMNodeData> = {
  value: {
    modelId: WORKFLOW_MODEL_DEFAULT_ID,
    systemPrompt: '',
    userPrompt: '',
    assistantPrompt: '',
    enableVision: false,
    retryOnFailure: false,
    retryCount: 1,
    retryIntervalMs: 1000,
    exceptionStrategy: LLM_DEFAULT_EXCEPTION_STRATEGY,
    exceptionDefaultValue: '',
  },
  validate: function (payload: LLMNodeData, t: any, data?: any): { valid: boolean; errorMessage?: string; } {
    if (!payload.modelId) {
      return { valid: false, errorMessage: t('workflow.checkList.error.llmModelMissing') };
    }

    if (!payload.inputVariable?.nodeId || !payload.inputVariable?.path?.length) {
      return { valid: false, errorMessage: t('workflow.checkList.error.llmInputVariableMissing') };
    }

    if (!payload.systemPrompt?.trim()) {
      return { valid: false, errorMessage: t('workflow.checkList.error.llmSystemPromptMissing') };
    }

    if (!payload.userPrompt?.trim()) {
      return { valid: false, errorMessage: t('workflow.checkList.error.llmUserPromptMissing') };
    }

    return { valid: true };
  }
};
