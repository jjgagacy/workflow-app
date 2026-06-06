import type { NodeDefaultData } from "../../types";
import { WORKFLOW_MODEL_DEFAULT_ID } from "../../components/nodes-shared/model-options";
import type { LLMNodeData } from "./types";

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
    exceptionStrategy: 'stop-execution',
    exceptionDefaultValue: '',
  },
};
