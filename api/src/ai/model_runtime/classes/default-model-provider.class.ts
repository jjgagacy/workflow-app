import { IsOptional } from "class-validator";
import { ModelType } from "../enums/model-runtime.enum";
import { I18nObject } from "./model-runtime.class";

export class DefaultModelProvider {
  provider: string;

  label: I18nObject;

  @IsOptional()
  iconSmall?: I18nObject;

  @IsOptional()
  iconLarge?: I18nObject;

  supportedModelTypes: ModelType[];
}
