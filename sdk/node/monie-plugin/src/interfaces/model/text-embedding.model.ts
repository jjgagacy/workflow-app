import { ModelType } from "@/core/entities/enums/model.enum";
import { EmbeddingInputType, TextEmbeddingResult } from "@/core/entities/model/text-embedding.entity";
import { AIModel } from "@/core/entities/plugin/ai-model";
import { PriceInfo, PriceType } from "@/core/entities/pricing";

export abstract class TextEmbeddingModel extends AIModel {
  modelType: ModelType = ModelType.TEXT_EMBEDDING;

  constructor() {
    super();
  }

  abstract invoke(
    model: string,
    credentials: Record<string, any>,
    texts: string[],
    user: string | undefined,
    inputType: EmbeddingInputType,
  ): Promise<TextEmbeddingResult> | TextEmbeddingResult;

  abstract getNumTokens(
    model: string,
    credentials: Record<string, any>,
    texts: string[],
  ): Promise<number> | number;

  abstract getPrice(
    model: string,
    credentials: Record<string, any>,
    priceType: PriceType,
    tokens: number
  ): PriceInfo;

}
