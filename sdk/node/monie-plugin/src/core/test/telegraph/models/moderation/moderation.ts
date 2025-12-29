import { AIModel } from "@/core/entities/plugin/ai-model";
import { ModerationModel } from "@/interfaces/model/moderation.model";

export class OpenAIModerationModel extends ModerationModel {
  getModelSchema(model: string, credentials?: Record<string, any>): Promise<AIModel | undefined> {
    throw new Error("Method not implemented.");
  }
  validateCredentials(model: string, credentials: Record<string, any>): Promise<void> {
    throw new Error("Method not implemented.");
  }
}