import { ModelType } from "@/core/entities/enums/model.enum.js";
import { AIModel } from "@/core/entities/plugin/ai-model.js";
import { ClassWithMarker } from "../marker.class.js";

export const MODERATION_MODEL_SYMBOL = Symbol.for('plugin.moderation.model');

export abstract class ModerationModel extends AIModel {
  static [MODERATION_MODEL_SYMBOL] = true;
  modelType: ModelType = ModelType.MODERATION;

  constructor() {
    super();
  }
}

export type ModerationModelClassType = ClassWithMarker<ModerationModel, typeof MODERATION_MODEL_SYMBOL>;
export function isModerationModelClass(cls: any): cls is ModerationModelClassType {
  return Boolean(cls?.[MODERATION_MODEL_SYMBOL]);
}
