import { ModelFeature, ModelType } from "../enums/model.enum.js";
import { PriceConfig } from "../pricing.js";
import { ProviderBase, AIProviderBase } from "./provider-base.js";

export const AIMODEL_SYMBOL = Symbol.for('plugin.ai-model');

export abstract class AIModel {
  static [AIMODEL_SYMBOL] = true;
  modelType: ModelType = ModelType.LLM;
  modelSchemas: AIProviderBase[];

  constructor(modelSchemas: AIProviderBase[] = []) {
    this.modelSchemas = modelSchemas;
  }

  abstract getModelSchema(
    model: string,
    credentials?: Record<string, any>,
  ): Promise<AIModel | undefined>;

  abstract validateCredentials(model: string, credentials: Record<string, any>): Promise<void>;
}
