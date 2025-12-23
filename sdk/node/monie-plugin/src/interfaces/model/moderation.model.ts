import { ModelType } from "@/core/entities/enums/model.enum";
import { AIModel } from "@/core/entities/plugin/ai-model";

export abstract class ModerationModel extends AIModel {
  modelType: ModelType = ModelType.MODERATION;

  constructor() {
    super();
  }
}
