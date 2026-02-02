import { LLMResult, LLMChunkResult } from "@/core/entities/model/llm.entity";
import { AIModel } from "@/core/entities/plugin/ai-model";
import { PromptMessage, PromptMessageTool } from "@/core/entities/plugin/message/message";
import { PriceType, PriceInfo } from "@/core/entities/pricing";
import { LargeLanguageModel } from "@/interfaces/model/llm.model";
export declare class OpenAILargeLanguageModel extends LargeLanguageModel {
    invoke(model: string, credentials: Record<string, any>, promptMessages: PromptMessage[], modelParameters: Record<string, any>, tools?: PromptMessageTool[] | undefined, stop?: string[] | undefined, stream?: boolean, user?: string | undefined): Promise<LLMResult | AsyncGenerator<LLMChunkResult>>;
    private generate;
    protected handleCompletionStream(model: string, response: any, promptMessage: string): AsyncGenerator<LLMChunkResult>;
    private chatGenerate;
    getNumTokens(model: string, credentials: Record<string, any>, promptMessages: PromptMessage[], tools: PromptMessageTool[] | undefined): Promise<number>;
    getPrice(model: string, credentials: Record<string, any>, priceType: PriceType, tokens: number): PriceInfo;
    getModelSchema(model: string, credentials?: Record<string, any>): Promise<AIModel | undefined>;
    validateCredentials(model: string, credentials: Record<string, any>): Promise<void>;
}
//# sourceMappingURL=llm.d.ts.map