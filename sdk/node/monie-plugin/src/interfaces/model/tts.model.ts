import { ModelType } from "../../core/entities/enums/model.enum.js";
import { TTSVoice } from "../../core/entities/model/tts.entity.js";
import { AIModel } from "../../core/entities/plugin/ai-model.js";
import { PriceInfo, PriceType } from "../../core/entities/pricing.js";
import { ClassWithMarker } from "../marker.class.js";

export const TTS_MODEL_SYMBOL = Symbol.for('plugin.tts.model');

export abstract class TTSModel extends AIModel {
  static [TTS_MODEL_SYMBOL] = true;
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

export type TTSModelClassType = ClassWithMarker<TTSModel, typeof TTS_MODEL_SYMBOL>;
export function isTTSModelClass(cls: any): cls is TTSModelClassType {
  return Boolean(cls?.[TTS_MODEL_SYMBOL]);
}
