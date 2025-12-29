import { AIModel } from "@/core/entities/plugin/ai-model";
import { PriceType, PriceInfo } from "@/core/entities/pricing";
import { TTSModel } from "@/interfaces/model/tts.model";

export class OpenAIText2SpeechModel extends TTSModel {
  invoke(model: string, tenantId: string, credentials: Record<string, any>, contextText: string, voice: string, user?: string | null): Promise<Buffer | Uint8Array> | Buffer | Uint8Array | AsyncGenerator<Buffer | Uint8Array> | Generator<Buffer | Uint8Array> {
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