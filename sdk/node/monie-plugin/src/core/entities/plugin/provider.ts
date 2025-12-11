import { CommonParameterType, FormType } from "../enums/form.enum";
import { ConfigurateMethod, ModelType } from "../enums/model.enum";
import { I18nObject } from "../i18n";
import { AIModel } from "./ai-model";
import { PluginFiles } from "./manifest";
import { OauthSchema } from "./oauth";
import { ParameterOption } from "./parameter";
import { ToolProviderIdentity } from "./tool";

export type Mapping<T = any> = Record<string, T>;

export class ProviderConfig {
  name: string;
  type: CommonParameterType;
  label: I18nObject;
  required: boolean;
  default: boolean;
  options?: ParameterOption[];
  help?: I18nObject | undefined;
  placeholder?: I18nObject | undefined;
  min?: number | undefined;
  max?: number | undefined;
  precision?: number | undefined;
  inputSchema?: Mapping | undefined;

  constructor(data: Partial<ProviderConfig> = {}) {
    this.name = data.name || '';
    this.type = data.type || CommonParameterType.STRING;
    this.label = data.label || {};
    this.required = data.required || false;
    this.default = data.default || false;
    this.options = data.options || [];
    this.help = data.help || undefined;
    this.placeholder = data.placeholder;
    this.min = data.min;
    this.max = data.max;
    this.precision = data.precision;
    this.inputSchema = data.inputSchema;
  }
}

export class ToolProviderConfiguration {
  identity: ToolProviderIdentity;
  credentialsForProvider: ProviderConfig[] = [];
  oauthSchema?: OauthSchema | undefined;
  plugins: PluginFiles;

  constructor(data: Partial<ToolProviderConfiguration>) {
    this.identity = data.identity || new ToolProviderIdentity();
    this.credentialsForProvider = data.credentialsForProvider || [];
    this.oauthSchema = data.oauthSchema || undefined;
    this.plugins = data.plugins || new PluginFiles();
  }
}


export class FormShowOnObject {
  variable: string;
  value: string;

  constructor(data: Partial<FormShowOnObject> = {}) {
    this.variable = data.variable || '';
    this.value = data.value || '';
  }
}

export class FormOption {
  label: I18nObject;
  value: string;
  showOn: FormShowOnObject[] = [];

  constructor(data: Partial<FormOption> = {}) {
    this.label = data.label || {};
    this.value = data.value || '';
    this.showOn = data.showOn || [];
  }
}

export class CredentialFormSchema {
  variable: string;
  label: I18nObject;
  type: FormType;
  required: boolean = true;
  default?: string | undefined;
  options?: FormOption[] = [];
  placeholder?: I18nObject | undefined;
  maxLength: number = 0;
  showOn: FormShowOnObject[] = [];

  constructor(data: Partial<CredentialFormSchema> = {}) {
    this.variable = data.variable || '';
    this.label = data.label || {};
    this.type = data.type || FormType.TEXT_INPUT;
    this.required = data.required || true;
    this.default = data.default;
    this.options = data.options || [];
    this.placeholder = data.placeholder;
    this.maxLength = data.maxLength || 0;
    this.showOn = data.showOn || [];
  }
}

export class ProviderCredentialSchema {
  credentialFormSchemas: CredentialFormSchema[] = [];
}

export class FieldModelSchema {
  label: I18nObject;
  placeholder?: I18nObject | undefined;

  constructor(data: Partial<FieldModelSchema> = {}) {
    this.label = data.label || {};
    this.placeholder = data.placeholder;
  }
}

export class ModelCredentialSchema {
  model: FieldModelSchema;
  credentialFormSchemas: CredentialFormSchema[] = [];

  constructor(data: Partial<ModelCredentialSchema> = {}) {
    this.model = data.model || new FieldModelSchema();
    this.credentialFormSchemas = data.credentialFormSchemas || [];
  }
}

export class ProviderHelp {
  title: I18nObject;
  url: I18nObject;

  constructor(data: Partial<ProviderHelp>) {
    this.title = data.title || {};
    this.url = data.url || {};
  }
}

export class Provider {
  provider: string;
  label: I18nObject;
  description?: I18nObject | undefined;
  iconSmall?: I18nObject | undefined;
  iconLarge?: I18nObject | undefined;
  background?: string | undefined;
  help?: ProviderHelp | undefined;

  supportedModelTypes: ModelType[] = [];
  configurateMethod: ConfigurateMethod[] = [];

  providerCredentialSchema?: ProviderCredentialSchema | undefined;
  modeScredentialSchema?: ModelCredentialSchema | undefined;

  models: AIModel[] = [];
  position?: Record<string, string[]>;

  constructor(data: Partial<Provider> = {}) {
    this.provider = data.provider || '';
    this.label = data.label || {};
    Object.assign(this, data);
  }

  toSimpleProvider(): SimpleProvider {
    return SimpleProvider.create(this);
  }
}

export class SimpleProvider {
  provider: string;
  label: I18nObject;
  iconSmall?: I18nObject | undefined;
  iconLarge?: I18nObject | undefined;

  models: AIModel[];
  supportedModelTypes: ModelType[];

  constructor(provider: Partial<SimpleProvider> = {}) {
    this.provider = provider.provider || '';
    this.label = provider.label || {};
    this.iconSmall = provider.iconSmall;
    this.iconLarge = provider.iconLarge;
    this.models = provider.models || [];
    this.supportedModelTypes = provider.supportedModelTypes || [];
  }

  static create(provider: Provider): SimpleProvider {
    const simpleProvider = new SimpleProvider();
    Object.assign(simpleProvider, provider);
    return simpleProvider;
  }
}


