import { ProviderModelSettingEntity } from "@/account/entities/provider-model-setting.entity";
import { ProviderEntity } from "@/account/entities/provider.entity";
import { TenantPreferredProviderEntity } from "@/account/entities/tenant-preferred-provider.entity";
import { MonieConfig } from "@/monie/monie.config";
import { Injectable, NotImplementedException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { ProviderConfiguration, ProviderConfigurations } from "../classes/provider.configuration";
import { ModelType } from "../enums/model-runtime.enum";
import { ProviderModelBundle } from "../entities/model.entity";
import { Provider } from "../classes/provider.class";
import { DefaultModel } from "../classes/default-model.class";
import { TenantDefaultModelEntity } from "@/account/entities/tenant-default-model.entity";
import { ModelProviderPlugin } from "../classes/plugin/model-provider.plugin";
import { ProviderModel } from "../classes/provider-model.class";
import { CustomProviderConfiguration, SystemConfiguration } from "../entities/quota.entity";
import { ProviderType } from "../enums/provider.enum";
import { ModelSettings } from "../interfaces/model.interface";
import { ModelProviderID } from "@/ai/plugin/entities/provider-id.entities";

@Injectable()
export class ProviderService {
  constructor(
    @InjectRepository(ProviderEntity)
    private readonly providerRepository: Repository<ProviderEntity>,
    @InjectRepository(ProviderModelSettingEntity)
    private readonly providerModelSettingRepository: Repository<ProviderModelSettingEntity>,
    @InjectRepository(TenantPreferredProviderEntity)
    private readonly tenantPreferredProviderRepository: Repository<TenantPreferredProviderEntity>,
    private readonly monieConfig: MonieConfig,
    private readonly modelProviderPlugin: ModelProviderPlugin,
  ) { }

  async getConfigurations(tenantId: string): Promise<ProviderConfigurations> {
    // 获取所有提供商记录
    const allProvidersMapRecords = await this.modelProviderPlugin.getAllProviderEntities(tenantId);
    // 初始化试用提供商记录
    const addAllProvidersRecords = await this.modelProviderPlugin.initTrialProvider(tenantId, allProvidersMapRecords);
    // 获取所有提供商模型记录
    const allProviderModelRecords = await this.modelProviderPlugin.getAllProviderModels(tenantId);
    // 获取所有提供商实体
    const allProviders = await this.modelProviderPlugin.getAllProviders(tenantId);
    // 获取首选提供商类型
    const preferredModelProviders = await this.modelProviderPlugin.getPreferredModelProviders(tenantId);
    // 获取所有提供商模型设置
    const allProviderModelSettings = await this.modelProviderPlugin.getAllProviderModelSettings(tenantId);
    // 构建提供商配置对象
    const providerConfigurations = new ProviderConfigurations(tenantId);
    for (const provider of allProviders) {
      const includeSet = new Set<string>(this.monieConfig.modelProviderPositionIncludes());
      const excludeSet = new Set<string>(this.monieConfig.modelProviderPositionExcludes());
      if (this.isFiltered(includeSet, excludeSet, provider, (x: Provider) => x.provider)) {
        continue;
      }

      const providerName = provider.provider;
      const providers = addAllProvidersRecords.get(providerName) || [];
      const providerModels = allProviderModelRecords.get(providerName) || [];

      // 转换为自定义配置
      const customConfiguration = await this.toCustomConfiguration(tenantId, provider, providers, providerModels);
      // 转换为系统配置
      const systemConfiguration = await this.toSystemConfiguration(tenantId, provider, providers);
      // 获取首选提供商类型
      let preferredProviderModel = preferredModelProviders.get(providerName);
      if (!preferredProviderModel) {
        const providerId = new ModelProviderID(providerName);
        preferredProviderModel = preferredModelProviders.get(providerId.toString());
      }
      let preferredProviderType: ProviderType;
      if (preferredProviderModel) {
        preferredProviderType = preferredProviderModel.preferredProviderType as ProviderType;
      } else if (customConfiguration.credentials && customConfiguration.models) {
        preferredProviderType = ProviderType.CUSTOM;
      } else if (systemConfiguration.enabled) {
        preferredProviderType = ProviderType.SYSTEM;
      } else {
        preferredProviderType = ProviderType.CUSTOM;
      }
      let usingProviderType = preferredProviderType;
      const hasValidQuota = systemConfiguration.quotaConfiguration.some(quota => quota.isValid);
      if (preferredProviderType == ProviderType.SYSTEM) {
        if (!systemConfiguration.enabled || !hasValidQuota) {
          usingProviderType = ProviderType.CUSTOM;
        }
      } else {
        if (!customConfiguration.credentials && customConfiguration.models.length == 0) {
          if (systemConfiguration.enabled && hasValidQuota) {
            usingProviderType = ProviderType.SYSTEM;
          }
        }
      }
      // 获取提供商模型设置
      let providerModelSettings = allProviderModelSettings.get(providerName) || [];
      // 转换为模型设置
      const modelSettings = await this.toModelSettings(provider, providerModelSettings);

      const providerConfiguration = new ProviderConfiguration(this, {
        tenantId,
        provider,
        preferredProviderType,
        usingProviderType,
        systemConfiguration,
        customConfiguration,
        modelSettings
      });
      providerConfigurations.set(providerName, providerConfiguration);
    }
    return providerConfigurations;
  }

  async getProviderModelBundle(
    tenantId: string,
    provider: string,
    modelType: ModelType
  ): Promise<ProviderModelBundle> {
    throw new NotImplementedException();
  }

  async getDefaultModel(tenantId: string, modelType: ModelType): Promise<DefaultModel> {
    throw new NotImplementedException();
  }

  async getFirstProviderModel(tenantId: string, modelType: ModelType): Promise<[string | null, string | null]> {
    throw new NotImplementedException();
  }

  async updateDefaultModel(tenantId: string, modelType: ModelType, provider: string, model: string): Promise<TenantDefaultModelEntity> {
    throw new NotImplementedException();
  }

  private async getAllProviders(tenantId: string): Promise<Map<string, Provider[]>> {
    throw new NotImplementedException();
  }

  private async getPreferredModelProviders(tenantId: string): Promise<Map<string, TenantPreferredProviderEntity>> {
    throw new NotImplementedException();
  }

  private isFiltered(includeSet: Set<string>, excludeSet: Set<string>, data: any, nameFunc: (x: any) => string): boolean {
    const name = nameFunc(data);
    if (includeSet.size > 0 && !includeSet.has(name)) return true;
    if (excludeSet.size > 0 && excludeSet.has(name)) return true;
    return false;
  }

  private async toCustomConfiguration(
    tenantId: string,
    provider: Provider,
    providerEntities: ProviderEntity[],
    providerModels: ProviderModel[]
  ): Promise<CustomProviderConfiguration> {
    throw new NotImplementedException();
  }

  private async toSystemConfiguration(
    tenantId: string,
    provider: Provider,
    providers: ProviderEntity[],
  ): Promise<SystemConfiguration> {
    throw new NotImplementedException();
  }

  private async toModelSettings(
    provider: Provider,
    providerModelSettings: ProviderModelSettingEntity[]
  ): Promise<ModelSettings[]> {
    throw new NotImplementedException();
  }
}

