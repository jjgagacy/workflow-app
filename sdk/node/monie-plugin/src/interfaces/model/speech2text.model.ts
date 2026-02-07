import { ModelType } from "../../core/entities/enums/model.enum.js";
import { AudioFile, Speech2TextOptions } from "../../core/entities/model/speech2text.entity.js";
import { AIModel } from "../../core/entities/plugin/ai-model.js";
import { ClassWithMarker } from "../marker.class.js";

export const SPEECH2TEXT_MODEL_SYMBOL = Symbol.for('plugin.speech2text.model');

export abstract class Speech2TextModel extends AIModel {
  static [SPEECH2TEXT_MODEL_SYMBOL] = true;
  modelType: ModelType = ModelType.SPEECH2TEXT;

  constructor() {
    super();
  }

  abstract invoke(
    model: string,
    credentials: Record<string, any>,
    file: AudioFile,
    user?: string | null,
    options?: Speech2TextOptions,
  ): Promise<string> | string;
}

export type Speech2TextModelClassType = ClassWithMarker<Speech2TextModel, typeof SPEECH2TEXT_MODEL_SYMBOL>;
export function isSpeech2TextModelClass(cls: any): cls is Speech2TextModelClassType {
  return Boolean(cls?.[SPEECH2TEXT_MODEL_SYMBOL]);
}
