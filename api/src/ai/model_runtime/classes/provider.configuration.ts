import { Injectable, NotImplementedException } from "@nestjs/common";
import { ProviderType } from "../enums/provider.enum";
import { CustomProviderConfiguration, SystemConfiguration } from "../entities/quota.entity";
import { Provider } from "./provider.class";
import { InjectRepository } from "@nestjs/typeorm";
import { ProviderEntity } from "@/account/entities/provider.entity";
import { Repository } from "typeorm";
import { ProviderModelSettingEntity } from "@/account/entities/provider-model-setting.entity";
import { TenantPreferredProviderEntity } from "@/account/entities/tenant-preferred-provider.entity";
import { ModelType } from "../enums/model-runtime.enum";
import { SystemConfigurationStatus } from "../enums/quota.enum";
import { Credentials } from "../types/credentials.type";
import { ModelSettings } from "../interfaces/model.interface";
import { ModelWithProvider } from "./provider-model-status.class";

export interface ConfigurationData {
  tenantId: string;
  provider: Provider;
  preferredProviderType: ProviderType;
  usingProviderType: ProviderType;
  systemConfiguration: SystemConfiguration;
  customConfiguration: CustomProviderConfiguration;
  modelSettings: ModelSettings[];
}

@Injectable()
export class ProviderConfiguration {
  constructor(
    @InjectRepository(ProviderEntity)
    private readonly providerRepository: Repository<ProviderEntity>,
    @InjectRepository(ProviderModelSettingEntity)
    private readonly providerModelSettingRepository: Repository<ProviderModelSettingEntity>,
    @InjectRepository(TenantPreferredProviderEntity)
    private readonly tenantPreferredProviderRepository: Repository<TenantPreferredProviderEntity>,
  ) { }

  async getProviderModel(
    configurationData: ConfigurationData,
    modelType: ModelType,
    model: string,
    onlyActive: boolean = false
  ): Promise<ModelWithProvider | null> {
    const providerModels = await this.getProviderModels(configurationData, modelType, onlyActive, model);
    return providerModels.find(providerModel => providerModel.model === model) || null;
  }

  async getProviderModels(
    configurationData: ConfigurationData,
    modelType: ModelType,
    onlyActive: boolean = false,
    model?: string
  ): Promise<ModelWithProvider[]> {
    return [];
  }

  async getCurrentCredentials(
    configurationData: ConfigurationData,
    modelType: ModelType,
    model: string
  ): Promise<Credentials | null> {
    return null;
  }

  async getSystemConfigurationStatus(
    configurationData: ConfigurationData,
  ): Promise<SystemConfigurationStatus | null> {
    return null;
  }

  getCustomCredentials(
    configurationData: ConfigurationData,
    obfucated: boolean = false
  ): Credentials | null {
    return null;
  }

  async getCustomProviderCredentials(
    configurationData: ConfigurationData
  ): Promise<Provider | null> {
    return null;
  }

  async validateCustomCredentials(
    configurationData: ConfigurationData,
    credentials: Credentials,
  ): Promise<[Provider | null, Credentials]> {
    return [null, {}];
  }

  async upsertCustomCredentials(
    configurationData: ConfigurationData,
    credentials: Credentials
  ): Promise<void> {
  }
}

export class ProviderCofigurations {
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

