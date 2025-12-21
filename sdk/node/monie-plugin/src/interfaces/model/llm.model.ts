import { LLMChunkResult, LLMResult } from "@/core/entities/model/llm";
import { AIModel } from "@/core/entities/plugin/ai-model";
import { PromptMessage, PromptMessageTool } from "@/core/entities/plugin/message/message";

export abstract class LargeLanguageModel extends AIModel {
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

}
