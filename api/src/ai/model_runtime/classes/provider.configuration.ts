import { NotImplementedException } from "@nestjs/common";
import { ProviderType } from "../enums/provider.enum";
import { CustomProviderConfiguration, SystemConfiguration } from "../entities/quota.entity";
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
import { ModelProviderDeclaration } from "./model-provider.class";
import { PluginModelProvider } from "./plugin/model-provider";
import { ModelStatus } from "../enums/model-status.enum";

export interface ConfigurationOptions {
  tenantId: string;
  provider: ModelProviderDeclaration;
  preferredProviderType: ProviderType;
  usingProviderType: ProviderType;
  systemConfiguration: SystemConfiguration;
  customConfiguration: CustomProviderConfiguration;
  modelSettings: ModelSettings[];
}

/**
 * ProviderConfiguration class manages the configuration for a specific provider within a tenant.
 */
export class ProviderConfiguration {
  tenantId: string;
  provider: ModelProviderDeclaration;
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
    modelType?: ModelType,
    onlyActive: boolean = false,
    modelProviderPlugin: ModelProviderDeclaration[] = [],
    model?: string,
  ): Promise<ModelWithProvider | null> {
    const providerModels = await this.getProviderModels(modelType, onlyActive, modelProviderPlugin, model);
    return providerModels.find(providerModel => providerModel.model === model) || null;
  }

  async getProviderModels(
    modelType?: ModelType,
    onlyActive: boolean = false,
    modelProviderPlugin: ModelProviderDeclaration[] = [],
    model?: string,
  ): Promise<ModelWithProvider[]> {
    const providerDeclaration = modelProviderPlugin.find(decl => decl.provider === this.provider.provider);
    if (!providerDeclaration) {
      return [];
    }

    const modelTypes: ModelType[] = modelType ? [modelType] : providerDeclaration.supportedModelTypes;
    const modelSettingMap: Partial<Record<ModelType, Record<string, ModelSettings>>> = {};
    for (const setting of this.modelSettings) {
      if (!modelSettingMap[setting.modelType]) {
        modelSettingMap[setting.modelType] = {};
      }
      modelSettingMap[setting.modelType]![setting.model] = setting;
    }

    let providerModels: ModelWithProvider[] = [];
    if (this.usingProviderType === ProviderType.SYSTEM) {
      providerModels = this.getSystemProviderModels(modelTypes, providerDeclaration, modelSettingMap);
    } else {
      providerModels = this.getCustomProviderModels(modelTypes, providerDeclaration, modelSettingMap, model);
    }

    if (onlyActive) {
      providerModels = providerModels.filter(providerModel => providerModel.status === 'active');
    }

    return this.sortProviderModels(providerModels);
  }

  private sortProviderModels(providerModels: ModelWithProvider[]): ModelWithProvider[] {
    return [...providerModels].sort((a, b) => {
      if (a.modelType !== b.modelType) {
        return a.modelType.localeCompare(b.modelType);
      }
      return a.model.localeCompare(b.model);
    });
  }

  private getSystemProviderModels(
    modelTypes: ModelType[],
    providerDeclaration: ModelProviderDeclaration,
    modelSettingMap: Partial<Record<ModelType, Record<string, ModelSettings>>>
  ): ModelWithProvider[] {
    const providerModels: ModelWithProvider[] = [];
    for (const modelType of modelTypes) {
      for (const model of providerDeclaration.models.filter(m => m.modelType === modelType)) {
        let status = ModelStatus.ACTIVE;
        const modelSetting = modelSettingMap[modelType]?.[model.model];
        if (modelSetting && !modelSetting.enabled) {
          status = ModelStatus.DISABLED;
        }

        providerModels.push(new ModelWithProvider({
          ...model,
          status,
          provider: this.provider.toSimpleProvider(),
        }));
      }
    }

    return providerModels;
  }

  private getCustomProviderModels(
    modelTypes: ModelType[],
    providerDeclaration: ModelProviderDeclaration,
    modelSettingMap: Partial<Record<ModelType, Record<string, ModelSettings>>>,
    specificModel?: string
  ): ModelWithProvider[] {
    const credentials: Credentials | null = this.customConfiguration.credentials ?? null;
    const providerModels: ModelWithProvider[] = [];
    for (const modelType of modelTypes) {
      for (const model of providerDeclaration.models.filter(m => m.modelType === modelType)) {
        if (specificModel && model.model !== specificModel) {
          continue;
        }

        let status = credentials ? ModelStatus.ACTIVE : ModelStatus.DISABLED;
        const modelSetting = modelSettingMap[modelType]?.[model.model];
        if (modelSetting && !modelSetting.enabled) {
          status = ModelStatus.DISABLED;
        }

        providerModels.push(new ModelWithProvider({
          ...model,
          status,
          provider: this.provider.toSimpleProvider(),
        }));
      }
    }

    return providerModels;
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

  async getSystemConfigurationStatus(): Promise<SystemConfigurationStatus | null> {
    if (!this.systemConfiguration.enabled) {
      return null;
    }
    const quota = this.systemConfiguration.quotaConfiguration.find(
      (q) => q.quotaType === this.systemConfiguration.currentQuotaType
    );
    if (!quota) return null;

    return quota.isValid ? SystemConfigurationStatus.ACTIVE : SystemConfigurationStatus.QUOTA_EXCEEDED;
  }

  getCustomCredentials(obfuscated: boolean = false): Credentials | null {
    const credentials = this.customConfiguration.credentials;
    if (!credentials) return null;
    if (!obfuscated) return credentials ?? null;

    return this.obfuscatCredentials(
      credentials,
      this.provider.providerCredentialSchema?.credentialFormSchema ?? []
    );
  }

  getCustomModelCredentials(modelName: string, modelType: ModelType, obfuscated: boolean = false): Credentials | null {
    if (this.customConfiguration.models.length === 0)
      return null;

    for (const modelConfiguration of this.customConfiguration.models) {
      if (modelConfiguration.model === modelName && modelConfiguration.modelType === modelType) {
        const credentials = modelConfiguration.credentials;
        if (!obfuscated) return credentials;

        // Obfuscated credentials
        return this.obfuscatCredentials(credentials, this.provider.modelCredentialSchema?.credentialFormSchema || []);
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

  customConfigurationAvailable(): boolean {
    return this.customConfiguration.credentials !== undefined || this.customConfiguration.models.length > 0;
  }
}

/**
 * ProviderConfigurations class manages a collection of ProviderConfiguration instances for a specific tenant.
 */
export class ProviderConfigurations {
  configurations: Record<string, ProviderConfiguration> = {};

  constructor(public tenantId: string) { }

  async getModels(
    modelType?: ModelType,
    provider?: string,
    modelProviderPlugin: ModelProviderDeclaration[] = [],
    onlyActive: boolean = false
  ): Promise<ModelWithProvider[]> {
    const models: ModelWithProvider[] = [];
    for (const config of this.values()) {
      if (provider && config.provider.provider !== provider) continue;
      const providerModels = await config.getProviderModels(modelType, onlyActive, modelProviderPlugin);
      models.push(...providerModels);
    }
    return models;
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
