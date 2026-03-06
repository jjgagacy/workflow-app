import { LLMUsage } from "./llm-usage.class";
import { IsOptional } from "class-validator";
import { PriceInfo } from "../model-runtime.class";
import { PromptMessage } from "@/ai/prompt/classes/prompt-message.class";
import { AssistantPromptMessage } from "@/ai/prompt/classes/messages/assistant-message.class";

/**
 * LLM 调用结果类
 */
export interface LLMResultProps {
  id?: string;
  model: string;
  promptMessage?: PromptMessage[];
  message: AssistantPromptMessage;
  usage: LLMUsage;
  systemFingerprint: string;
}

export class LLMResult {
  id?: string;

  // 模型名称
  model: string;

  // 提示消息列表
  promptMessage: PromptMessage[];

  // 助手返回消息
  message: AssistantPromptMessage;

  // 用量统计信息
  usage: LLMUsage;

  // 系统指纹标识
  systemFingerprint: string;

  constructor(props: LLMResultProps) {
    this.id = props.id;
    this.model = props.model;
    this.promptMessage = props.promptMessage ?? [];
    this.message = props.message;
    this.usage = props.usage;
    this.systemFingerprint = props.systemFingerprint;
  }
}
/**
 * 大模型结构化输出
 */
export class LLMStructuredOutput {
  structuredOutput: Record<string, any>;

  constructor(structuredOutput: Record<string, any>) {
    this.structuredOutput = structuredOutput;
  }
}

/**
 * 大模型结构化输出结果类
 */
export class LLMStructureResult extends LLMResult {
  @IsOptional()
  structuredOutput?: Record<string, any>;
}


export interface LLMChunkDeltaResultProps {
  index?: number;
  message: AssistantPromptMessage;
  usage?: LLMUsage;
  finishReason?: string;
}

/**
 * 流式输出增量
 */
export class LLMChunkDeltaResult {
  // 数据块索引
  index: number;
  // 增量消息内容
  message: AssistantPromptMessage;
  // 增量用量
  @IsOptional()
  usage?: LLMUsage;
  // 完成原因
  @IsOptional()
  finishReason?: string;

  constructor(props: LLMChunkDeltaResultProps) {
    this.index = props.index ?? 0;
    this.message = props.message;
    this.usage = props.usage;
    this.finishReason = props.finishReason;
  }
}


export interface LLMChunkResultProps {
  model: string;
  promptMessage?: PromptMessage[];
  systemFingerprint?: string;
  delta: LLMChunkDeltaResult;
}

/**
 * 流式输出数据块
 */
export class LLMChunkResult {
  // 模型名称
  model: string;
  // 提示消息
  promptMessage: PromptMessage[];
  // 系统指纹
  @IsOptional()
  systemFingerprint?: string;
  // 增量数据
  delta: LLMChunkDeltaResult;

  constructor(props: LLMChunkResultProps) {
    this.model = props.model;
    this.promptMessage = props.promptMessage ?? [];
    this.systemFingerprint = props.systemFingerprint ?? '';
    this.delta = props.delta;
  }
}

/**
 * 带结构化输出的流式数据块
 */
export class LLMStructureChunkResult extends LLMChunkResult {
  @IsOptional()
  structuredOutput?: Record<string, any>;
}

/**
 * Token数量结果
 */
export class PriceTokensResult extends PriceInfo {
  tokens: number;

  constructor(tokens: number, priceInfo: PriceInfo) {
    super(priceInfo);
    this.tokens = tokens;
  }
}

