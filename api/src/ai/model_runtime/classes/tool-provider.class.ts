import { CredentialFormSchema, Mapping } from "../entities/form.entity";
import { I18nObject } from "./model-runtime.class";
import { ToolConfigurationExtra } from "./plugin/extra";
import { OauthSchema } from "./plugin/oauth";
import { ToolParameter } from "./plugin/tool";

export class ToolIdentity {
  author: string;
  name: string;
  label: I18nObject;

  constructor(data: Partial<ToolIdentity> = {}) {
    this.author = data.author || '';
    this.name = data.name || '';
    this.label = data.label || new I18nObject({ en_US: this.name });
  }
}

export class ToolProviderIdentity {
  name: string;
  label: I18nObject;
  description: I18nObject;
  icon?: string;
  supportedFileUploadMethods?: string;

  constructor(data: Partial<ToolProviderIdentity> = {}) {
    this.name = data.name || '';
    this.label = data.label || new I18nObject({ en_US: this.name });
    this.description = data.description || new I18nObject({ en_US: this.name });
    this.icon = data.icon || '';
    this.supportedFileUploadMethods = data.supportedFileUploadMethods || '';
  }
}

export class ToolDescription {
  human: I18nObject;

  constructor(data: Partial<ToolDescription> = {}) {
    this.human = data.human || new I18nObject({ en_US: '' });
  }
}


export class ToolConfiguration {
  identity: ToolIdentity;
  parameters: ToolParameter[] = [];
  description: ToolDescription;
  extra: ToolConfigurationExtra;
  outputSchema?: Mapping | undefined;

  constructor(data: Partial<ToolConfiguration>) {
    this.identity = data.identity || new ToolIdentity();
    this.parameters = data.parameters || [];
    this.description = data.description || new ToolDescription();
    this.extra = data.extra || new ToolConfigurationExtra();
    this.outputSchema = data.outputSchema;
  }
}

export class ToolProviderDeclaration {
  identity: ToolProviderIdentity;
  credentialFormSchemas: CredentialFormSchema[] = [];
  oauthSchema: OauthSchema | undefined;
  tools: ToolConfiguration[] = [];
  toolFiles: string[] = [];

  constructor(data: Partial<ToolProviderDeclaration>) {
    this.identity = data.identity || new ToolProviderIdentity();
    this.credentialFormSchemas = data.credentialFormSchemas || [];
    this.oauthSchema = data.oauthSchema;
    this.tools = data.tools || [];
    this.toolFiles = data.toolFiles || [];
  }
}