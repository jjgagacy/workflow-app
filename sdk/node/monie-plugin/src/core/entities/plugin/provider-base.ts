import { FetchFrom, ModelFeature, ModelPropertyKey, ModelType } from "../enums/model.enum";
import { I18nObject } from "../i18n";

export class ProviderBase {
  model: string;
  modelProperties: { [key in ModelPropertyKey]?: any };
  label: I18nObject;
  modelType: ModelType;

  features?: ModelFeature[];
  fetchFrom: FetchFrom;

  deprecated?: boolean = false;

  constructor(data: Partial<ProviderBase> = {}) {
    this.model = data.model || '';
    this.modelProperties = data.modelProperties || {};
    this.label = data.label || {};
    this.modelType = ModelType.LLM;
    this.features = data.features || [];
    this.fetchFrom = FetchFrom.PREDEFINED_MODEL;
    this.deprecated = data.deprecated || false;
  }
}
