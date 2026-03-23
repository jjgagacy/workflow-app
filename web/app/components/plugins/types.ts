import { CredentialFormSchema } from "@/api/graphql/model-provider/types/model-provider";
import { I18nObject } from "@/api/graphql/types/i18n";

export type ProviderType = 'model' | 'tool' | 'endpoint';

export type Plugin = {
  providerType: ProviderType;
  author: string;
  name: string;
  icon: string;
  label: Record<string, string>;
  description?: Record<string, string>;
}

export type PluginInstallation = {
  id: string;
  name: string;
  pluginId: string;
  tenantId: string;
  version: string;
  meta: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export type CredentialFormSchemaTextInput = CredentialFormSchema;
export type CredentialFormSchemaTextSelect = CredentialFormSchema;
export type CredentialFormSchemaRadio = CredentialFormSchema;
export type CredentialFormSchemaSecretInput = CredentialFormSchema;
export type CredentialFormSchemaNumberInput = CredentialFormSchema & {
  min?: number;
  max?: number;
}

export type CredentialFormSchemaAll =
  | CredentialFormSchemaTextInput
  | CredentialFormSchemaTextSelect
  | CredentialFormSchemaRadio
  | CredentialFormSchemaSecretInput
  | CredentialFormSchemaNumberInput;

export enum ConfigurationMethod {
  predefinedModel = 'predefined-model',
  customizableModel = 'customizable-model',
}