import { ModelType } from "../enums/model-runtime.enum";

export interface ModelSettings {
  modelType: ModelType;
  model: string;
  enabled: boolean;
}

