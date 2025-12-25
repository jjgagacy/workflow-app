import { ModelType } from "@/core/entities/enums/model.enum";
import { LLMChunkResult, LLMMode, LLMResult, LLMUsage } from "@/core/entities/model/llm.entity";
import { AIModel } from "@/core/entities/plugin/ai-model";
import { PromptMessage, PromptMessageTool } from "@/core/entities/plugin/message/message";
import { ParameterRule } from "@/core/entities/plugin/parameter";
import { PriceInfo, PriceType } from "@/core/entities/pricing";
import { ClassWithMarker } from "../marker.class";

export const LARGE_LANGUAGE_MODEL_SYMBOL = Symbol.for('plugin.largelanguage.model');

export abstract class LargeLanguageModel extends AIModel {
  static [LARGE_LANGUAGE_MODEL_SYMBOL] = true;
  modelType: ModelType = ModelType.LLM;

  constructor() {
    super();
  }

  abstract invoke(
    model: string,
    credentials: Record<string, any>,
    promptMessages: PromptMessage[],
    modelParameters: Record<string, any>,
    tools?: PromptMessageTool[] | undefined,
    stop?: string[] | undefined,
    stream?: boolean,
    user?: string | undefined
  ): LLMResult | AsyncGenerator<LLMChunkResult>;

  abstract getNumTokens(
    model: string,
    credentials: Record<string, any>,
    promptMessages: PromptMessage[],
    tools: PromptMessageTool[] | undefined
  ): Promise<number>;

  abstract getPrice(
    model: string,
    credentials: Record<string, any>,
    priceType: PriceType,
    tokens: number,
  ): PriceInfo;

  enforceStopTokens(text: string, stop: string[]): string {
    return "";
  }

  getParameterRule(model: string, credentials: Record<string, any>): ParameterRule[] {
    throw new Error(`Not impl`);
  }

  getModelMode(model: string, credentials?: Record<string, any>): LLMMode {
    throw new Error(`Not impl`);
  }

  protected calcResponseUsage(
    model: string,
    credentials: Record<string, any>,
    promptTokens: number,
    completionTokens: number
  ): LLMUsage {
    throw new Error(`Not impl`);
  }

  protected validateAndFilterModelParameters(
    model: string,
    modelParameters: Record<string, any>,
    credentials: Record<string, any>
  ): Record<string, any> {
    throw new Error(`Not impl`);
  }

  protected async codeBlockModeWrapper() {
  }

  private async codeBlockModeStreamProcessor() {
  }

  private async codeBlockModeStreamProcessorWithBacktick() {
  }

  protected wrapThinkingByReasoningContent() {
  }

  private isLLMResult(obj: any): obj is LLMResult {
    throw new Error(`Not impl`);
  }

  private isAsyncGenerator(obj: any): obj is AsyncGenerator<LLMChunkResult> {
    throw new Error(`Not impl`);
  }
}

export type LargeLanguageModelClassType = ClassWithMarker<LargeLanguageModel, typeof LARGE_LANGUAGE_MODEL_SYMBOL>;
export function isLargeLanguageModelClass(cls: any): cls is LargeLanguageModelClassType {
  return Boolean(cls?.[LARGE_LANGUAGE_MODEL_SYMBOL]);
}
