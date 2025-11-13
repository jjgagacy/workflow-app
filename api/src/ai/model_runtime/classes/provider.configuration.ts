import { Injectable, NotImplementedException, Scope } from "@nestjs/common";
import { ProviderType } from "../enums/provider.enum";
import { CustomProviderConfiguration, SystemConfiguration } from "../entities/quota.entity";
import { Provider } from "./provider.class";
import { ModelType } from "../enums/model-runtime.enum";
import { SystemConfigurationStatus } from "../enums/quota.enum";
import { Credentials } from "../types/credentials.type";
import { ModelSettings } from "../interfaces/model.interface";
import { ModelWithProvider } from "./provider-model-status.class";
import { ProviderService } from "../services/provider.service";

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
    public providerService: ProviderService,
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

  async getCurrentCredentials(
    modelType: ModelType,
    model: string
  ): Promise<Credentials | null> {
    return null;
  }

  async getSystemConfigurationStatus(
  ): Promise<SystemConfigurationStatus | null> {
    return null;
  }

  getCustomCredentials(
    obfucated: boolean = false
  ): Credentials | null {
    return null;
  }

  async getCustomProviderCredentials(
  ): Promise<Provider | null> {
    return null;
  }

  async validateCustomCredentials(
    credentials: Credentials,
  ): Promise<[Provider | null, Credentials]> {
    return [null, {}];
  }

  async upsertCustomCredentials(
    credentials: Credentials
  ): Promise<void> {
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

