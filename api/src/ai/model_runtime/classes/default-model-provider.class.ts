import { IsOptional } from "class-validator";
import { ModelType } from "../enums/model-runtime.enum";
import { I18nObject } from "./model-runtime.class";

export interface DefaultModelProviderProps {
  provider: string;
  label: I18nObject;

  iconSmall?: I18nObject;
  iconLarge?: I18nObject;

  supportedModelTypes: ModelType[];
}

export class DefaultModelProvider {
  provider: string;
  label: I18nObject;

  @IsOptional()
  iconSmall?: I18nObject;

  @IsOptional()
  iconLarge?: I18nObject;

  supportedModelTypes: ModelType[];

  constructor(props: DefaultModelProviderProps) {
    this.provider = props.provider;
    this.label = props.label;
    this.iconSmall = props.iconSmall;
    this.iconLarge = props.iconLarge;
    this.supportedModelTypes = props.supportedModelTypes;
  }
}