import { Provider } from "../provider.js"
import { NodeConfig } from "./extra.js";
import { ModelType } from "../../enums/model.enum.js";
import { AIModel } from "../ai-model.js";

export class ModelPythonExtra {
  providerSource: string;
  modelSources: string[] = [];

  constructor(data: Partial<ModelPythonExtra>) {
    this.providerSource = data.providerSource || '';
    this.modelSources = data.modelSources || [];
  }
}

export class ModelProviderConfigurationExtra {
  python?: ModelPythonExtra;
  node?: NodeConfig;
}

export class ModelProviderConfiguration extends Provider {
  extra: ModelProviderConfigurationExtra;

  constructor(data: Partial<Provider & { extra: ModelProviderConfigurationExtra }>) {
    super(data);
    this.extra = data.extra || new ModelProviderConfigurationExtra();
  }
}

export class ModelProvider {
  providerSchema: Provider;
  modelInstance: Map<ModelType, AIModel>;

  constructor(providerSchema: Provider, modelInstance: Map<ModelType, AIModel> | Record<string, AIModel>) {
    this.providerSchema = providerSchema;

    if (modelInstance instanceof Map) {
      this.modelInstance = modelInstance;
    } else {
      this.modelInstance = new Map(Object.entries(modelInstance) as [ModelType, AIModel][]);
    }
  }
}
