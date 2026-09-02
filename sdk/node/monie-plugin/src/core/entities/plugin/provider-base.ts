import { FetchFrom, ModelFeature, ModelPropertyKey, ModelType } from "../enums/model.enum.js";
import { I18nObject } from "../i18n.js";
import { PriceConfig } from "../pricing.js";
import { ParameterRule } from "./parameter.js";

export class ProviderBase {
  model: string;
  modelProperties: { [key in ModelPropertyKey]?: any };
  label: I18nObject;
  modelType: ModelType;

  features?: ModelFeature[];
  fetchFrom: FetchFrom;
  parameterRoles?: ParameterRule[];

  deprecated?: boolean = false;

  constructor(data: Partial<ProviderBase> = {}) {
    this.model = data.model || '';
    this.modelProperties = data.modelProperties || {};
    this.label = data.label || {};
    this.modelType = ModelType.LLM;
    this.features = data.features || [];
    this.fetchFrom = FetchFrom.PREDEFINED_MODEL;
    this.parameterRoles = data.parameterRoles || [];
    this.deprecated = data.deprecated || false;
  }
}

export class AIProviderBase extends ProviderBase {
  priceConfig?: PriceConfig;

  private validateModel(): void {
    if (!this.features) {
      this.features = [ModelFeature.STRUCTURED_OUTPUT];
    } else {
      this.features.push(ModelFeature.STRUCTURED_OUTPUT);
    }
  }
}
