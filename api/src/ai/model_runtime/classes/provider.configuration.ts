import { NotImplementedException } from "@nestjs/common";
import { ProviderType } from "../enums/provider.enum";
import { CustomProviderConfiguration, SystemConfiguration } from "../entities/quota.entity";
import { Provider } from "./provider.class";
import { ModelType } from "../enums/model-runtime.enum";
import { SystemConfigurationStatus } from "../enums/quota.enum";
import { Credentials } from "../types/credentials.type";
import { ModelSettings } from "../interfaces/model.interface";
import { ModelWithProvider } from "./provider-model-status.class";
import { ProviderManager } from "../services/provider-manager";
import { CredentialFormSchema, extractSecretVariables } from "../entities/form.entity";
import { obfuscateToken } from "@/encryption/encryption.service";
import { ProviderEntity } from "@/account/entities/provider.entity";
import { EntityManager } from "typeorm";

export interface ConfigurationOptions {
  tenantId: string;
  provider: Provider;
  preferredProviderType: ProviderType;
  usingProviderType: ProviderType;
  systemConfiguration: SystemConfiguration;
  customConfiguration: CustomProviderConfiguration;
  modelSettings: ModelSettings[];
}

export class ProviderConfiguration {
  tenantId: string;
  provider: Provider;
  preferredProviderType: ProviderType;
  usingProviderType: ProviderType;
  systemConfiguration: SystemConfiguration;
  customConfiguration: CustomProviderConfiguration;
  modelSettings: ModelSettings[];

  constructor(
    public providerManager: ProviderManager,
    public configurationOptions: ConfigurationOptions
  ) {
    this.tenantId = configurationOptions.tenantId;
    this.provider = configurationOptions.provider;
    this.preferredProviderType = configurationOptions.preferredProviderType;
    this.usingProviderType = configurationOptions.usingProviderType;
    this.systemConfiguration = configurationOptions.systemConfiguration;
    this.customConfiguration = configurationOptions.customConfiguration;
    this.modelSettings = configurationOptions.modelSettings || [];
  }

  async getProviderModel(
    modelType: ModelType,
    model: string,
    onlyActive: boolean = false
  ): Promise<ModelWithProvider | null> {
    const providerModels = await this.getProviderModels(modelType, onlyActive, model);
    return providerModels.find(providerModel => providerModel.model === model) || null;
  }

  async getProviderModels(
    modelType: ModelType,
    onlyActive: boolean = false,
    model?: string
  ): Promise<ModelWithProvider[]> {
    return [];
  }

  modelDisabledByModelSetting(
    model: string,
    modelType: ModelType,
    modelSettings: ModelSettings[],
  ): boolean {
    return modelSettings.some(
      (s) => s.modelType === modelType && s.model === model && !s.enabled
    );
  }

  async getCurrentCredentials(
    model: string,
    modelType: ModelType,
  ): Promise<Credentials | null> {
    if (this.modelSettings) {
      if (this.modelDisabledByModelSetting(model, modelType, this.modelSettings))
        return null;
    }

    if (this.usingProviderType === ProviderType.SYSTEM) {
      const quotaConfiguration = this.systemConfiguration.quotaConfiguration.find(
        (q) => q.quotaType === this.systemConfiguration.currentQuotaType
      );

      const restrictModels = quotaConfiguration?.restrictModel ?? [];
      const credentials = { ...(this.systemConfiguration.credentials ?? {}) };

      for (const rm of restrictModels) {
        if (rm.model === model && rm.modelType === modelType) {
          credentials['base_model_name'] = rm.baseModel;
        }
      }
      return credentials;
    } else {
      let credentials: Credentials | undefined;
      const modelConfiguration = this.customConfiguration.models.find(
        (m) => m.modelType === modelType && m.model === model
      );
      if (modelConfiguration) credentials = modelConfiguration.credentials;
      if (!credentials && this.customConfiguration.credentials) {
        credentials = this.customConfiguration.credentials;
      }
      return credentials ?? null;
    }
  }

  async getSystemConfigurationStatus(
  ): Promise<SystemConfigurationStatus | null> {
    if (!this.systemConfiguration.enabled) {
      return null;
    }
    const quota = this.systemConfiguration.quotaConfiguration.find(
      (q) => q.quotaType === this.systemConfiguration.currentQuotaType
    );
    if (!quota) return null;

    return quota.isValid ? SystemConfigurationStatus.ACTIVE : SystemConfigurationStatus.QUOTA_EXCEEDED;
  }

  getCustomCredentials(
    obfuscated: boolean = false
  ): Credentials | null {
    const credentials = this.customConfiguration.credentials;
    if (!credentials) return null;
    if (!obfuscated) return credentials ?? null;

    return this.obfuscatCredentials(
      credentials,
      this.provider.providerCredentialSchema?.credentialFromSchemas ?? []
    );
  }

  getCustomModelCredentials(
    modelName: string,
    modelType: ModelType,
    obfuscated: boolean = false
  ): Credentials | null {
    if (this.customConfiguration.models.length === 0)
      return null;

    for (const modelConfiguration of this.customConfiguration.models) {
      if (modelConfiguration.model === modelName && modelConfiguration.modelType === modelType) {
        const credentials = modelConfiguration.credentials;
        if (!obfuscated) return credentials;

        // Obfuscated credentials
        return this.obfuscatCredentials(credentials, this.provider.modeScredentialSchema?.credentialFormSchemas || []);
      }
    }

    return null;
  }

  obfuscatCredentials(credentials: Credentials, credentialFormSchema: CredentialFormSchema[]): Credentials {
    const secretVariables = extractSecretVariables(credentialFormSchema);

    const copy = { ...credentials };
    for (const key of secretVariables) {
      if (copy[key]) copy[key] = obfuscateToken(copy[key]);
    }
    return copy;
  }

  async upsertCustomCredentials(
    credentials: Credentials,
    entityManager?: EntityManager,
  ): Promise<ProviderEntity> {
    return this.providerManager.addOrUpdateCustomCredentials(this, credentials, entityManager);
  }
}

export class ProviderConfigurations {
  configurations: Record<string, ProviderConfiguration> = {};

  constructor(public tenantId: string) { }

  getModels(
    provider?: string,
    modelType?: ModelType,
    onlyActive: boolean = false
  ): ModelWithProvider[] {
    throw new NotImplementedException();
  }

  toList(): ProviderConfiguration[] {
    return Object.values(this.configurations);
  }

  get(key: string): ProviderConfiguration | undefined {
    const normalizeKey = this.normalizeProviderKey(key);
    return this.configurations[normalizeKey];
  }

  set(key: string, value: ProviderConfiguration): void {
    const normalizeKey = this.normalizeProviderKey(key);
    this.configurations[normalizeKey] = value;
  }

  private normalizeProviderKey(key: string): string {
    return key;
  }

  *values(): IterableIterator<ProviderConfiguration> {
    for (const configuration of Object.values(this.configurations)) {
      yield configuration;
    }
  }
}

