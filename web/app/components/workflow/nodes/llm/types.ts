import type { NodeData, VariableSelector } from "../../types";

export type SelectItem = {
  value: string;
  name: string;
  description?: string;
};

export type LLMExceptionStrategy = 'stop-execution' | 'return-default';

export type LLMNodeData = NodeData<{
  modelId?: string;
  inputVariable?: VariableSelector;
  systemPrompt?: string;
  userPrompt?: string;
  assistantPrompt?: string;
  enableVision?: boolean;
  retryOnFailure?: boolean;
  retryCount?: number;
  retryIntervalMs?: number;
  exceptionStrategy?: LLMExceptionStrategy;
  exceptionDefaultValue?: string;
  outputVariableName?: string;
}>;
