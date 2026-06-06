import type { NodeData } from "../../types";

export type LLMExceptionStrategy = 'stop-execution' | 'return-default';

export type LLMNodeData = NodeData<{
  modelId?: string;
  inputVariable?: string;
  systemPrompt?: string;
  userPrompt?: string;
  assistantPrompt?: string;
  enableVision?: boolean;
  retryOnFailure?: boolean;
  retryCount?: number;
  retryIntervalMs?: number;
  exceptionStrategy?: LLMExceptionStrategy;
  exceptionDefaultValue?: string;
}>;
