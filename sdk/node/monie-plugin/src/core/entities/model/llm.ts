import { AssistantPromptMessage, PromptMessage } from "../plugin/message/message";

export class LLMResult {
  id?: string;
  model: string;
  promptMessage: PromptMessage[] = [];
  message: AssistantPromptMessage;
  usage: LLMUsage;
  systemFingerprint: string;

  constructor(data: Partial<LLMResult>) {
    Object.assign(this, data);
    this.model = data.model || '';
    this.usage = data.usage || new LLMUsage();
    this.message = data.message || new AssistantPromptMessage({});
    this.systemFingerprint = data.systemFingerprint || '';
  }
}

export class LLMStructuredOutput {
  structuredOutput: Record<string, any>;

  constructor(output: Record<string, any>) {
    this.structuredOutput = output;
  }
}

export class LLMStructureResult extends LLMResult {
  structuredOutput?: Record<string, any>;
}

export class LLMChunkDeltaResult {
  index: number = 0;
  message: AssistantPromptMessage;
  usage?: LLMUsage;
  finishReason?: string;

  constructor(data: Partial<LLMChunkDeltaResult>) {
    Object.assign(this, data);
    this.message = data.message || new AssistantPromptMessage({});
  }
}

export class LLMChunkResult {
  model: string;
  promptMessage: PromptMessage[] = [];
  systemFingerprint?: string = '';
  delta: LLMChunkDeltaResult;

  constructor(data: Partial<LLMChunkResult>) {
    Object.assign(this, data);
    this.model = data.model || '';
    this.delta = data.delta || new LLMChunkDeltaResult({});
  }
}

export class LLMStructureChunkResult extends LLMChunkResult {
  structuredOutput?: Record<string, any>;
}

export class ModelUsage {
}

export class LLMUsage extends ModelUsage {
  promptTokens: number = 0;
  promptUnitPrice: number = 0;
  promptPricePerUnit: number = 0;
  promptPrice: number = 0;
  completionTokens: number = 0;
  completionUnitPrice: number = 0;
  completionPricePerUnit: number = 0;
  completionPrice: number = 0;
  totalTokens: number = 0;
  totalPrice: number = 0;
  currency: string = 'USD';
  latency: number = 0;
}
