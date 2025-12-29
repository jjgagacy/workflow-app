import { AudioFile, Speech2TextOptions } from "@/core/entities/model/speech2text.entity";
import { AIModel } from "@/core/entities/plugin/ai-model";
import { Speech2TextModel } from "@/interfaces/model/speech2text.model";

export class OpenAISpeech2TextModel extends Speech2TextModel {
  invoke(model: string, credentials: Record<string, any>, file: AudioFile, user?: string | null, options?: Speech2TextOptions): Promise<string> | string {
    throw new Error("Method not implemented.");
  }
  getModelSchema(model: string, credentials?: Record<string, any>): Promise<AIModel | undefined> {
    throw new Error("Method not implemented.");
  }
  validateCredentials(model: string, credentials: Record<string, any>): Promise<void> {
    throw new Error("Method not implemented.");
  }
}