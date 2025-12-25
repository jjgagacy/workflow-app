import { ModelType } from "@/core/entities/enums/model.enum";
import { EmbeddingInputType, TextEmbeddingResult } from "@/core/entities/model/text-embedding.entity";
import { AIModel } from "@/core/entities/plugin/ai-model";
import { PriceInfo, PriceType } from "@/core/entities/pricing";
import { ClassWithMarker } from "../marker.class";

export const TEXT_EMBEDDING_MODEL_SYMBOL = Symbol.for('plugin.textembedding.model');

export abstract class TextEmbeddingModel extends AIModel {
  static [TEXT_EMBEDDING_MODEL_SYMBOL] = true;
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

export type TextEmbeddingModelClassType = ClassWithMarker<TextEmbeddingModel, typeof TEXT_EMBEDDING_MODEL_SYMBOL>;
export function isTextEmbeddingModelClass(cls: any): cls is TextEmbeddingModelClassType {
  return Boolean(cls?.[TEXT_EMBEDDING_MODEL_SYMBOL]);
}
