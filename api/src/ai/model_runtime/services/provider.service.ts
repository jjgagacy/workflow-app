import { ProviderModelSettingEntity } from "@/account/entities/provider-model-setting.entity";
import { ProviderEntity } from "@/account/entities/provider.entity";
import { TenantPreferredProviderEntity } from "@/account/entities/tenant-preferred-provider.entity";
import { MonieConfig } from "@/monie/monie.config";
import { Injectable, NotImplementedException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { DataSource, EntityManager, Repository } from "typeorm";
import { ProviderConfiguration, ProviderConfigurations } from "../classes/provider.configuration";
import { ModelType } from "../enums/model-runtime.enum";
import { ProviderModelBundle } from "../entities/model.entity";
import { Provider } from "../classes/provider.class";
import { DefaultModel } from "../classes/default-model.class";
import { TenantDefaultModelEntity } from "@/account/entities/tenant-default-model.entity";
import { ModelProviderPlugin } from "../classes/plugin/model-provider.plugin";
import { CustomProviderConfiguration, SystemConfiguration } from "../entities/quota.entity";
import { ProviderType } from "../enums/provider.enum";
import { ModelSettings } from "../interfaces/model.interface";
import { ModelProviderID, normalizeProviderName } from "@/ai/plugin/entities/provider-id.entities";
import { ProviderListService } from "./provider-list.service";
import { groupToMap, groupToMaps } from "@/common/utils/map";
import { ProviderModelEntity } from "@/account/entities/provider-model.entity";
import { HostConfiguration } from "@/ai/plugin/services/host-configuration";
import { QuotaType } from "../enums/quota.enum";
import { HostingQuota } from "../entities/hosting-quota.entity";
import { Transactional } from "@/common/decorators/transaction.decorator";

@Injectable()
export class ProviderService {
  constructor(
    @InjectRepository(ProviderEntity)
    private readonly providerRepository: Repository<ProviderEntity>,
    @InjectRepository(ProviderModelSettingEntity)
    private readonly providerModelSettingRepository: Repository<ProviderModelSettingEntity>,
    @InjectRepository(TenantPreferredProviderEntity)
    private readonly tenantPreferredProviderRepository: Repository<TenantPreferredProviderEntity>,
    @InjectRepository(ProviderModelEntity)
    private readonly providerModelRepository: Repository<ProviderModelEntity>,
    private readonly monieConfig: MonieConfig,
    private readonly modelProviderPlugin: ModelProviderPlugin,
    private readonly hostConfiguration: HostConfiguration,
    private readonly providerListService: ProviderListService,
    private readonly dataSource: DataSource,
  ) { }

  async getConfigurations(tenantId: string): Promise<ProviderConfigurations> {
    // 获取所有提供商记录
    const allProvidersMapEntities = await this.getAllProviderEntities(tenantId);
    // 初始化试用提供商记录
    const addAllProvidersEntities = await this.initTrialProvider(tenantId, allProvidersMapEntities);
    // 获取所有提供商模型记录
    const allProviderModelEntities = await this.getAllProviderModelEntities(tenantId);
    // 获取所有提供商
    const allProviders = await this.modelProviderPlugin.getAllProviders(tenantId);
    // 获取首选提供商类型
    const preferredModelEntities = await this.getPreferredModelProviders(tenantId);
    // 获取所有提供商模型设置
    const allProviderModelSettings = await this.getAllProviderModelSettings(tenantId);
    // 构建提供商配置对象
    const providerConfigurations = new ProviderConfigurations(tenantId);
    for (const provider of allProviders) {
      const includeSet = new Set<string>(this.monieConfig.modelProviderPositionIncludes());
      const excludeSet = new Set<string>(this.monieConfig.modelProviderPositionExcludes());
      if (this.isFiltered(includeSet, excludeSet, provider, (x: Provider) => x.provider)) {
        continue;
      }

      const providerName = provider.provider;
      const providerEntities = addAllProvidersEntities.get(providerName) || [];
      const providerModels = allProviderModelEntities.get(providerName) || [];

      // 转换为自定义配置
      const customConfiguration = await this.toCustomConfiguration(tenantId, provider, providerEntities, providerModels);
      // 转换为系统配置
      const systemConfiguration = await this.toSystemConfiguration(tenantId, provider, providerEntities);
      // 获取首选提供商类型
      let preferredProviderModel = preferredModelEntities.get(providerName);
      if (!preferredProviderModel) {
        const providerId = new ModelProviderID(providerName);
        preferredProviderModel = preferredModelEntities.get(providerId.toString());
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
      let providerModelSetting = allProviderModelSettings.get(providerName) || [];
      // 转换为模型设置
      const modelSettings = await this.toModelSettings(provider, providerModelSetting);

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
    providerModels: ProviderModelEntity[]
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

  async getAllProviderEntities(tenantId: string): Promise<Map<string, ProviderEntity[]>> {
    const { data: providers } = await this.providerListService.query({ tenantId, isValid: true });

    return groupToMaps(providers, (p) => normalizeProviderName(p.providerName));
  }

  async getAllProviderModelEntities(tenantId: string): Promise<Map<string, ProviderModelEntity[]>> {
    const providerModels = await this.providerModelRepository.find({
      where: { tenant: { id: tenantId }, isValid: true }
    });

    return groupToMaps(providerModels, (pm) => pm.providerName);
  }

  async getPreferredModelProviders(tenantId: string): Promise<Map<string, TenantPreferredProviderEntity>> {
    const preferredProviders = await this.tenantPreferredProviderRepository.find({
      where: { tenant: { id: tenantId } }
    });

    return groupToMap(preferredProviders, (p) => p.providerName);
  }

  async getAllProviderModelSettings(tenantId: string): Promise<Map<string, ProviderModelSettingEntity[]>> {
    const providerModelSettings = await this.providerModelSettingRepository.find({
      where: { tenant: { id: tenantId } }
    });

    return groupToMaps(providerModelSettings, (pms) => pms.providerName);
  }

  @Transactional()
  async initTrialProvider(
    tenantId: string,
    providerNameToProviderMaps: Map<string, ProviderEntity[]>,
    entityManager?: EntityManager
  ): Promise<Map<string, ProviderEntity[]>> {
    const workManager = entityManager ?? this.dataSource.manager;

    for (const [providerName, configuration] of this.hostConfiguration.providerMap) {
      if (!configuration.enabled)
        continue;

      const providerId = normalizeProviderName(providerName);
      const existingRecords = providerNameToProviderMaps.get(providerId) ?? [];
      // Group system provider and map by quota type
      const systemRecordsByQuota = this.groupSystemRecordsByQuota(existingRecords);

      // Ensure host configuration have trial records
      const hasTrialQuotaConfig = configuration.quotas.some(
        q => q.quotaType === QuotaType.TRIAL
      );
      if (!hasTrialQuotaConfig) continue;

      // Add trial records
      const hasTrialRecord = systemRecordsByQuota.has(QuotaType.TRIAL);

      if (!hasTrialRecord) {
        const existingByQuotaType = new Map(
          existingRecords
            .filter(r => r.providerType === ProviderType.SYSTEM)
            .map(r => [r.quotaType, r])
        );

        for (const quota of configuration.quotas) {
          if (quota.quotaType !== QuotaType.TRIAL) continue;

          const newRecord = await this.getOrCreateTrialRecord(
            tenantId,
            providerId,
            quota,
            existingByQuotaType,
            workManager,
          );

          existingRecords.push(newRecord);
          // Prevent duplicate quotaType
          existingByQuotaType.set(newRecord.quotaType, newRecord);
        }

        providerNameToProviderMaps.set(providerName, existingRecords);
      }
    }

    return providerNameToProviderMaps;
  }

  private groupSystemRecordsByQuota(records: ProviderEntity[]): Map<QuotaType, ProviderEntity> {
    const m = new Map<QuotaType, ProviderEntity>();
    for (const r of records) {
      if (r.providerType == ProviderType.SYSTEM) {
        m.set(r.quotaType as QuotaType, r);
      }
    }
    return m;
  }

  @Transactional()
  private async getOrCreateTrialRecord(
    tenantId: string,
    providerName: string,
    quota: HostingQuota,
    existingRecords: Map<string, ProviderEntity>,
    entityManager?: EntityManager,
  ): Promise<ProviderEntity> {
    const workManager = entityManager ?? this.dataSource.manager;

    const quotaType = quota.quotaType;
    // set valid if existing
    if (existingRecords.has(quotaType)) {
      const record = existingRecords.get(quotaType)!;

      if (!record.isValid) {
        record.isValid = true;
        await workManager.save(record);
      }

      return record;
    }

    // Locked by pessimistic locker
    const locked = await workManager
      .getRepository(ProviderEntity)
      .createQueryBuilder('p')
      .setLock('pessimistic_write')
      .where('p.tenant_id = :tenant', { tenant: tenantId })
      .andWhere('p.provider_name = :provider', { provider: providerName })
      .andWhere('p.provider_type = :type', { type: ProviderType.SYSTEM })
      .andWhere('p.quota_type = :quota', { quota: quotaType })
      .getOne();

    if (locked) {
      if (!locked.isValid) {
        locked.isValid = true;
        await workManager.save(locked);
      }

      return locked;
    }

    // insert 
    const newRecord = workManager.getRepository(ProviderEntity).create({
      tenant: { id: tenantId },
      providerName,
      providerType: ProviderType.SYSTEM,
      quotaType,
      quotaLimit: (quota as any).quotaLimit ?? 0,
      quotaUsed: 0,
      isValid: true,
    });

    await workManager.save(newRecord);
    return newRecord;
  }

}

