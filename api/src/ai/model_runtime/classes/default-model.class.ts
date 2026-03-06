import { ModelType } from "../enums/model-runtime.enum";
import { DefaultModelProvider } from "./default-model-provider.class";

export interface DefaultModelProps {
  model: string;
  modelType: ModelType;
  provider: DefaultModelProvider;
}

export class DefaultModel {
  model: string;
  modelType: ModelType;
  provider: DefaultModelProvider;

  constructor(props: DefaultModelProps) {
    this.model = props.model;
    this.modelType = props.modelType;
    this.provider = props.provider;
  }
}