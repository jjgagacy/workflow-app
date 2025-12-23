import { ModelType } from "@/core/entities/enums/model.enum";
import { RerankResult } from "@/core/entities/model/rerank.entity";
import { AIModel } from "@/core/entities/plugin/ai-model";

export abstract class RerankModel extends AIModel {
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
