import { I18nObject } from "../../types/i18n";

export interface ModelProvider {
  providerType: string;
  author: string;
  name: string;
  icon: string;
  label: I18nObject;
  description: I18nObject;
}

export interface RestrictModel {
  modelName: string;
  modelType: string;
  baseModelName: string;
}


export interface QuotaInfo {
  quotaType: string;
  quotaUnit: string;
  quotaLimit: number;
  quotaUsed: number;
  isValid: boolean;
  restrictModels: RestrictModel[];
}

export interface CustomConfiguration {
  status: string;
}

export interface SystemConfiguration {
  enabled: boolean;
  currentQuotaType: string;
  quotaList: QuotaInfo[];
}

export enum FormType {
  TEXT_INPUT = 'text-input',
  SECRET_INPUT = 'secret-input',
  SELECT = 'select',
  RADIO = 'radio',
  SWITCH = 'switch',
}


export interface FormOption {
  label: I18nObject;
  value: string;
}

export interface CredentialFormSchema {
  label: I18nObject;
  variable: string;
  type: FormType;
  required?: boolean;
  default?: string;
  options?: FormOption[];
  placeholder?: I18nObject;
  maxLength?: number;
}

export interface ProviderCredentialSchema {
  credentialFormSchema?: CredentialFormSchema[];
}

export interface FieldModelSchema {
  label: I18nObject;
  placeholder?: I18nObject;
}

export interface ModelCredentialSchema {
  model: FieldModelSchema;
  credentialFormSchema: CredentialFormSchema[];
}

export interface ModelProviderInfo {
  tenantId: string;
  providerName: string;
  label: I18nObject;

  description?: I18nObject;
  icon?: I18nObject;
  iconDark?: I18nObject;
  supportedModelTypes: string[];
  preferredProviderType: string;

  customConfiguration: CustomConfiguration;
  systemConfiguration: SystemConfiguration;

  providerCredentialSchema?: ProviderCredentialSchema;
  modelCredentialSchema?: ModelCredentialSchema;
}
