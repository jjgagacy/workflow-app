import { IsOptional } from "class-validator";
import { I18nObject } from "./model-runtime.class";
import { ModelType } from "../enums/model-runtime.enum";
import { AIModel } from "./ai-model.class";
import { ConfigurateMethod } from "../enums/provider.enum";
import { CredentialFormSchema } from "../entities/form.entity";

export class ProviderHelp {
  title: I18nObject;
  url: I18nObject;

  constructor(title: I18nObject, url: I18nObject) {
    this.title = title;
    this.url = url;
  }
}

export class ProviderCredentialSchema {
  credentialFormSchema?: CredentialFormSchema[];
}

export class FieldModelSchema {
  label: I18nObject;
  placeholder?: I18nObject;

  constructor(label: I18nObject, placeholder?: I18nObject) {
    this.label = label;
    this.placeholder = placeholder;
  }
}

export class ModelCredentialSchema {
  model: FieldModelSchema;
  credentialFormSchema: CredentialFormSchema[];

  constructor(model: FieldModelSchema, credentialFormSchema: CredentialFormSchema[]) {
    this.model = model;
    this.credentialFormSchema = credentialFormSchema;
  }
}

export interface ProviderProps {
  provider: string;
  label: I18nObject;

  description?: I18nObject;
  iconSmall?: I18nObject;
  iconSmallDark?: I18nObject;
  iconLarge?: I18nObject;
  iconLargeDark?: I18nObject;
  background?: string;
  help?: ProviderHelp;

  supportedModelTypes: ModelType[];
  configMethod: ConfigurateMethod[];

  providerCredentialSchema?: ProviderCredentialSchema;
  modelCredentialSchema?: ModelCredentialSchema;

  models: AIModel[];
  position?: Record<string, string[]>;
}

export class Provider {
  // 格式：org/name/provider
  provider: string;
  label: I18nObject;

  @IsOptional()
  description?: I18nObject;
  @IsOptional()
  iconSmall?: I18nObject;
  @IsOptional()
  iconSmallDark?: I18nObject;
  @IsOptional()
  iconLarge?: I18nObject;
  @IsOptional()
  iconLargeDark?: I18nObject;
  @IsOptional()
  background?: string;
  @IsOptional()
  help?: ProviderHelp;

  supportedModelTypes: ModelType[];
  configMethods: ConfigurateMethod[];

  // credentials
  providerCredentialSchema?: ProviderCredentialSchema;
  modelCredentialSchema?: ModelCredentialSchema;

  models: AIModel[];
  @IsOptional()
  position?: Record<string, string[]>;

  static validateModels(models: any): AIModel[] {
    if (!Array.isArray(models)) {
      return [];
    }
    if (!models || models.length === 0) {
      return [];
    }
    return models as AIModel[];
  }

  toSimpleProvider(): SimpleProvider {
    return new SimpleProvider(this);
  }

  constructor(props: ProviderProps) {
    this.provider = props.provider;
    this.label = props.label;

    this.description = props.description;
    this.iconSmall = props.iconSmall;
    this.iconSmallDark = props.iconSmallDark;
    this.iconLarge = props.iconLarge;
    this.iconLargeDark = props.iconLargeDark;
    this.background = props.background;
    this.help = props.help;

    this.supportedModelTypes = props.supportedModelTypes;
    this.configMethods = props.configMethod;

    this.providerCredentialSchema = props.providerCredentialSchema;
    this.modelCredentialSchema = props.modelCredentialSchema;

    this.models = Provider.validateModels(props.models);
    this.position = props.position;
  }
}

export class SimpleProvider {
  provider!: string;
  label!: I18nObject;
  @IsOptional()
  iconSmall?: I18nObject;
  @IsOptional()
  iconLarge?: I18nObject;

  models!: AIModel[];
  supportedModelTypes!: ModelType[];

  constructor(providerObj?: Provider) {
    if (providerObj) {
      const { provider, label, iconSmall, iconLarge, supportedModelTypes } = providerObj;
      Object.assign(this, { provider, label, iconSmall, iconLarge, supportedModelTypes });
    }
  }
}
