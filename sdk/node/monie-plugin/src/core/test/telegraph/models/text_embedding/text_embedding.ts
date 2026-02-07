import { EmbeddingInputType, TextEmbeddingResult } from "../../../../../core/entities/model/text-embedding.entity.js";
import { AIModel } from "../../../../../core/entities/plugin/ai-model.js";
import { PriceType, PriceInfo } from "../../../../../core/entities/pricing.js";
import { TextEmbeddingModel } from "../../../../../interfaces/model/text-embedding.model.js";

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