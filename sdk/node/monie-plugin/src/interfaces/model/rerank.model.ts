import { ModelType } from "../../core/entities/enums/model.enum.js";
import { RerankResult } from "../../core/entities/model/rerank.entity.js";
import { AIModel } from "../../core/entities/plugin/ai-model.js";
import { ClassWithMarker } from "../marker.class.js";

export const RERANK_MODEL_SYMBOL = Symbol.for('plugin.rerank.model');

export abstract class RerankModel extends AIModel {
  static [RERANK_MODEL_SYMBOL] = true;
  modelType: ModelType = ModelType.RERANK;

  constructor() {
    super();
  }

  abstract invoke(
    model: string,
    credentials: Record<string, any>,
    query: string,
    docs: string[],
    scoreThreshold?: number | null,
    topN?: number | null,
    user?: string | null,
  ): Promise<RerankResult> | RerankResult;
}

export type RerankModelClassType = ClassWithMarker<RerankModel, typeof RERANK_MODEL_SYMBOL>;
export function isRerankModelClass(cls: any): cls is RerankModelClassType {
  return Boolean(cls?.[RERANK_MODEL_SYMBOL]);
}
