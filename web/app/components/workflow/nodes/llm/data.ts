import type { NodeDefaultData } from "../../types";
import { WORKFLOW_MODEL_DEFAULT_ID } from "../../components/nodes-shared/model-options";
import type { LLMNodeData } from "./types";

export const LLM_DEFAULT_EXCEPTION_STRATEGY = 'stop-execution';

export const llmNodeDefaultData: NodeDefaultData<LLMNodeData> = {
  value: {
    modelId: WORKFLOW_MODEL_DEFAULT_ID,
    inputVariable: 'input',
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
};
