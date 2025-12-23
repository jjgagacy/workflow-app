import { ModelType } from "@/core/entities/enums/model.enum";
import { TTSVoice } from "@/core/entities/model/tts.entity";
import { AIModel } from "@/core/entities/plugin/ai-model";
import { PriceInfo, PriceType } from "@/core/entities/pricing";

export abstract class TTSModel extends AIModel {
  modelType: ModelType = ModelType.TTS

  constructor() {
    super();
  }

  abstract invoke(
    model: string,
    tenantId: string,
    credentials: Record<string, any>,
    contextText: string,
    voice: string,
    user?: string | null,
  ): Promise<Buffer | Uint8Array> | Buffer | Uint8Array | AsyncGenerator<Buffer | Uint8Array> | Generator<Buffer | Uint8Array>;


  abstract getPrice(
    model: string,
    credentials: Record<string, any>,
    priceType: PriceType,
    tokens: number,
  ): PriceInfo;

  getTTSModelVoices(
    model: string,
    credentials: Record<string, any>,
    language?: string | undefined,
  ): TTSVoice[] | null {
    return null;
  }
}

