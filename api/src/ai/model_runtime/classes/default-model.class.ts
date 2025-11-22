import { ModelType } from "../enums/model-runtime.enum";
import { DefaultModelProvider } from "./default-model-provider.class";

export class DefaultModel {
  model: string;
  modelType: ModelType;

  provider: DefaultModelProvider;
}
