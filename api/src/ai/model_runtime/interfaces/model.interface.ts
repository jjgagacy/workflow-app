import { ModelType } from "../enums/model-runtime.enum";

export class ModelSettings {
  constructor(
    public model: string,
    public modelType: ModelType,
    public enabled: boolean,
  ) { }
}

