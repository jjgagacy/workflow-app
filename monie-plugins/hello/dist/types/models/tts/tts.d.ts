import { AIModel } from "@/core/entities/plugin/ai-model";
import { PriceType, PriceInfo } from "@/core/entities/pricing";
import { TTSModel } from "@/interfaces/model/tts.model";
export declare class OpenAIText2SpeechModel extends TTSModel {
    invoke(model: string, tenantId: string, credentials: Record<string, any>, contextText: string, voice: string, user?: string | null): Promise<Buffer | Uint8Array> | Buffer | Uint8Array | AsyncGenerator<Buffer | Uint8Array> | Generator<Buffer | Uint8Array>;
    getPrice(model: string, credentials: Record<string, any>, priceType: PriceType, tokens: number): PriceInfo;
    getModelSchema(model: string, credentials?: Record<string, any>): Promise<AIModel | undefined>;
    validateCredentials(model: string, credentials: Record<string, any>): Promise<void>;
}
//# sourceMappingURL=tts.d.ts.map