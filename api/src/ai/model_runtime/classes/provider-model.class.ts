import { IsOptional } from "class-validator";
import { FetchFrom, ModelFeature, ModelPropertyKey, ModelType } from "../enums/model-runtime.enum";
import { I18nObject } from "./model-runtime.class";

/**
 * Model class for Provider
 */
export class ProviderModel {
  model: string;
  modelProperties: { [key in ModelPropertyKey]?: any };
  label: I18nObject;
  modelType: ModelType;

  @IsOptional()
  features?: ModelFeature[];
  fetchFrom: FetchFrom;

  @IsOptional()
  deprecated?: boolean = false;

  get supportStructureOutput(): boolean {
    return this.features?.includes(ModelFeature.STRUCTURED_OUTPUT) ?? false;
  }
}
