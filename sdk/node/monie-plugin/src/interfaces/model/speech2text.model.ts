import { ModelType } from "@/core/entities/enums/model.enum";
import { AudioFile, Speech2TextOptions } from "@/core/entities/model/speech2text.entity";
import { AIModel } from "@/core/entities/plugin/ai-model";


export abstract class Speech2TextModel extends AIModel {
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
