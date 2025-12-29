import { EmbeddingInputType, TextEmbeddingResult } from "@/core/entities/model/text-embedding.entity";
import { AIModel } from "@/core/entities/plugin/ai-model";
import { PriceType, PriceInfo } from "@/core/entities/pricing";
import { TextEmbeddingModel } from "@/interfaces/model/text-embedding.model";

export class OpenAITextEmbeddingModel extends TextEmbeddingModel {
  invoke(model: string, credentials: Record<string, any>, texts: string[], user: string | undefined, inputType: EmbeddingInputType): Promise<TextEmbeddingResult> | TextEmbeddingResult {
    throw new Error("Method not implemented.");
  }
  getNumTokens(model: string, credentials: Record<string, any>, texts: string[]): Promise<number> | number {
    throw new Error("Method not implemented.");
  }
  getPrice(model: string, credentials: Record<string, any>, priceType: PriceType, tokens: number): PriceInfo {
    throw new Error("Method not implemented.");
  }
  getModelSchema(model: string, credentials?: Record<string, any>): Promise<AIModel | undefined> {
    throw new Error("Method not implemented.");
  }
  validateCredentials(model: string, credentials: Record<string, any>): Promise<void> {
    throw new Error("Method not implemented.");
  }
}