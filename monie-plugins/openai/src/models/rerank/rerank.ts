import { AIModel, RerankModel, RerankResult } from "monie-plugin";

export class OpenAIRerankModel extends RerankModel {
  invoke(model: string, credentials: Record<string, any>, query: string, docs: string[], scoreThreshold?: number | null, topN?: number | null, user?: string | null): Promise<RerankResult> | RerankResult {
    throw new Error("Method not implemented.");
  }
  getModelSchema(model: string, credentials?: Record<string, any>): Promise<AIModel | undefined> {
    throw new Error("Method not implemented.");
  }
  validateCredentials(model: string, credentials: Record<string, any>): Promise<void> {
    throw new Error("Method not implemented.");
  }
}
