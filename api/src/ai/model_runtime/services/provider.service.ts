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
import { CustomProviderConfiguration, CustomProviderModel, QuotaConfiguration, SystemConfiguration } from "../entities/quota.entity";
import { ConfigurateMethod, ProviderType } from "../enums/provider.enum";
import { ModelSettings } from "../interfaces/model.interface";
import { ModelProviderID, normalizeProviderName } from "@/ai/plugin/entities/provider-id.entities";
import { ProviderListService } from "./provider-list.service";
import { groupToMap, groupToMaps } from "@/common/utils/map";
import { ProviderModelEntity } from "@/account/entities/provider-model.entity";
import { HostConfiguration } from "@/ai/plugin/services/host-configuration";
import { QuotaType, QuotaUnit } from "../enums/quota.enum";
import { HostingQuota } from "../entities/hosting-quota.entity";
import { Transactional } from "@/common/decorators/transaction.decorator";
import { QuotaTypeUnavailableError, QuotaUsedOrLimitNullError } from "@/ai/plugin/exceptions/quota.error";
import { I18nService } from "nestjs-i18n";
import { I18nTranslations } from "@/generated/i18n.generated";
import { CredentialFormSchema, extractSecretVariables, FormType } from "../entities/form.entity";
import { Credentials } from "../types/credentials.type";
import { ProviderCredentialsCacheProps, ProviderCredentialsCacheService } from "./provider-credentials-cache.service";
import { EncryptionService } from "@/encryption/encryption.service";
import { CredentialsCacheType } from "../types/cache.type";
import { GlobalConfig } from "rxjs";
import { GlobalLogger } from "@/logger/logger.service";
import { StorageService } from "@/storage/storage.service";
import { ProviderManager } from "./provider-manager";

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
    private readonly i18n: I18nService<I18nTranslations>,
    private readonly providerCredentialCacheService: ProviderCredentialsCacheService,
    private readonly encryptionService: EncryptionService,
    private readonly logger: GlobalLogger,
    private readonly storageService: StorageService,
    private readonly providerManager: ProviderManager
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
      const providerModelEntities = allProviderModelEntities.get(providerName) || [];

      // 转换为自定义配置
      const customConfiguration = await this.toCustomConfiguration(tenantId, provider, providerEntities, providerModelEntities);
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

      const providerConfiguration = new ProviderConfiguration(this.providerManager, {
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

  /**
   * toCustomConfiguration performs a full custom-provider restruction process.
   *   1. Extract secret variables from the provider's credential schema.
   *   2. Locate the tenant's custom provider record (non-system provider)
   *   3. Decrypts the provider credential from cache, or:
   *      - Parse raw encrypted config (JSON or raw string)
   *      - Descrpt RSA-encrypted string
   *      - Cache the decrypted credentials
   *   4. Extract secret variables from model credentials
   *   5. For each model:
   *      - Load decrypted credentials from the cache, or
   *      - Parse raw encrypted config, and cache the result
   */
  private async toCustomConfiguration(
    tenantId: string,
    provider: Provider,
    providerEntities: ProviderEntity[],
    providerModels: ProviderModelEntity[]
  ): Promise<CustomProviderConfiguration> {
    const secretVars = extractSecretVariables(provider.providerCredentialSchema?.credentialFromSchemas || [])
    // Extract the custom provider record
    let customProviderRecord: ProviderEntity | undefined;
    for (const providerRecord of providerEntities) {
      if (providerRecord.providerType === ProviderType.SYSTEM) continue;
      if (!providerRecord.encryptedConfig) continue;

      customProviderRecord = providerRecord;
      break;
    }
    // Load and decrypt custom provider credential
    let providerCredentials: Credentials | undefined;
    if (customProviderRecord) {
      providerCredentials = await this.getProviderCredential(tenantId, customProviderRecord, secretVars);
    }
    // Extract model-level credential secret variables
    const modelCredentialSecretVariables = extractSecretVariables(provider.modeScredentialSchema?.credentialFormSchemas || []);
    const customProviderModels: CustomProviderModel[] = [];

    for (const modelRecord of providerModels) {
      if (!modelRecord.encryptedConfig) continue;

      let modelCredentials = await this.getModelCredential(tenantId, modelRecord, modelCredentialSecretVariables);

      customProviderModels.push(
        new CustomProviderModel(
          modelRecord.modelName,
          modelRecord.modelType as ModelType,
          modelCredentials
        ),
      );
    }

    return new CustomProviderConfiguration(customProviderModels, providerCredentials);
  }

  /**
   * toSystemConfiguration constructs a configuration that uses only "system" providers 
   * and models (i.e., built-in or platform-defined providers), without any custom 
   * credentilas or overrides specified by the tenant.
   *   1. Load the provider's hosting configuration
   *   2. Build a dictionary mapping from system provider entities 
   *   3. Determine which quota type should be used as the active quota (paid > free > trial)
   *   4. Load Credentials
   *      - Load the default system-level credentials in the hosting config 
   *      - If the active quota type is free, overrides the credentials with the tenant's stored
   *        FREE-tier key from the database.
   */
  private async toSystemConfiguration(
    tenantId: string,
    provider: Provider,
    providerEntities: ProviderEntity[],
  ): Promise<SystemConfiguration> {
    const hostingConfig = this.hostConfiguration.providerMap.get(provider.provider);
    if (!hostingConfig?.enabled) {
      return new SystemConfiguration(false);
    }

    // Generate quotaType -> providerRecord Map
    const systemRecordMapByQuota = this.groupSystemRecordsByQuota(providerEntities);
    // Generate quotaConfigurations
    const quotaConfigurations: QuotaConfiguration[] = [];

    for (const quota of hostingConfig.quotas) {
      const providerRecord = systemRecordMapByQuota.get(quota.quotaType);
      // If not found in ProviderEntity table
      if (!providerRecord) {
        if (quota.quotaType === QuotaType.FREE) {
          quotaConfigurations.push(
            new QuotaConfiguration({
              quotaType: quota.quotaType,
              quotaUnit: hostingConfig.quotaUnit || QuotaUnit.TOKENS,
              quotaUsed: 0,
              quotaLimit: 0,
              isValid: false,
            })
          );
        }
        continue
      }

      // have record
      if (providerRecord.quotaLimit == null || providerRecord.quotaUsed == null) {
        throw QuotaUsedOrLimitNullError.create(this.i18n);
      }

      const isValid = providerRecord.quotaLimit === -1 || providerRecord.quotaUsed < providerRecord.quotaLimit;

      quotaConfigurations.push(
        new QuotaConfiguration({
          quotaType: quota.quotaType,
          quotaUnit: hostingConfig.quotaUnit || QuotaUnit.TOKENS,
          quotaUsed: providerRecord.quotaUsed,
          quotaLimit: providerRecord.quotaLimit,
          isValid,
          restrictModel: quota.restrictModels,
        })
      );
    }

    if (quotaConfigurations.length === 0) {
      return new SystemConfiguration(false);
    }

    // select current quotaType
    const currentQuotaType = this.choiceCurrentUsingQuotaType(quotaConfigurations);
    // Default to using credentials from hosting configuration (system built-in key)
    let currentCredentials = hostingConfig.credentials;

    // The free quota is not provided by the platform, so users must use their own 
    // keys to claim the free allowance.
    if (currentQuotaType === QuotaType.FREE) {
      const freeRecord = systemRecordMapByQuota.get(QuotaType.FREE);

      if (freeRecord) {
        const secretVars = extractSecretVariables(provider.providerCredentialSchema?.credentialFromSchemas || [])
        currentCredentials = await this.getProviderCredential(tenantId, freeRecord, secretVars);
      } else {
        currentCredentials = {};
      }
    }

    return new SystemConfiguration(
      true,
      quotaConfigurations,
      currentQuotaType,
      currentCredentials,
    );
  }

  private async toModelSettings(
    provider: Provider,
    providerModelSettings: ProviderModelSettingEntity[]
  ): Promise<ModelSettings[]> {
    let credentialsSecretVariables: string[] = [];
    if (provider.configurateMethod.includes(ConfigurateMethod.PREDEFINED_MODEL)) {
      credentialsSecretVariables = extractSecretVariables(
        provider.providerCredentialSchema?.credentialFromSchemas || []
      );
    } else {
      credentialsSecretVariables = extractSecretVariables(
        provider.modeScredentialSchema?.credentialFormSchemas || []
      );
    }
    const modelSettings: ModelSettings[] = [];
    if (providerModelSettings.length === 0) {
      return [];
    }

    for (const providerModelSetting of providerModelSettings) {
      modelSettings.push(new ModelSettings(
        providerModelSetting.modelName,
        providerModelSetting.modelType as ModelType,
        providerModelSetting.enabled
      ));
    }
    return modelSettings;
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

  private choiceCurrentUsingQuotaType(quotaConfigurations: QuotaConfiguration[]): QuotaType {
    const quotaTypeToConfigurationMap = groupToMap(quotaConfigurations, (qc) => qc.quotaType);
    let lastQuotaConfiguration: QuotaConfiguration | undefined;

    // Priority order: paid > free > trial
    for (const quotaType of [QuotaType.PAID, QuotaType.FREE, QuotaType.TRIAL]) {
      const quotaConfiguration = quotaTypeToConfigurationMap.get(quotaType);
      if (quotaConfiguration) {
        lastQuotaConfiguration = quotaConfiguration;
        if (quotaConfiguration.isValid) return quotaType;
      }
    }

    if (lastQuotaConfiguration) return lastQuotaConfiguration.quotaType;

    throw QuotaTypeUnavailableError.create(this.i18n);
  }

  private async getProviderCredential(tenantId: string, providerEntity: ProviderEntity, secretVars: string[]): Promise<Credentials> {
    const providerCredentialCacheProps = {
      tenantId,
      identityId: providerEntity.id,
      cacheType: CredentialsCacheType.PROVIDER,
    } as ProviderCredentialsCacheProps;

    const cachedData = await this.providerCredentialCacheService.getCredentials(providerCredentialCacheProps);
    if (cachedData)
      return cachedData;

    if (!providerEntity.encryptedConfig) return {};

    let credentials = this.safeJsonParse<Record<string, any>>(
      providerEntity.encryptedConfig,
      `Failed to parse provider credentials`
    ) || {};

    credentials = await this.decryptCredentialFields(
      tenantId,
      credentials,
      secretVars
    );

    if (credentials) await this.providerCredentialCacheService.setCredentials(providerCredentialCacheProps, credentials);
    return credentials;
  }

  private async getModelCredential(tenantId: string, modelEntity: ProviderModelEntity, secretVars: string[]): Promise<Credentials> {
    const providerCredentialCacheProps = {
      tenantId,
      identityId: modelEntity.id,
      cacheType: CredentialsCacheType.MODEL,
    } as ProviderCredentialsCacheProps;

    const cachedData = await this.providerCredentialCacheService.getCredentials(providerCredentialCacheProps);
    if (cachedData)
      return cachedData;

    if (!modelEntity.encryptedConfig) return {};

    let credentials = this.safeJsonParse<Record<string, any>>(
      modelEntity.encryptedConfig,
      `Failed to parse provider model credentials`
    ) || {};

    credentials = await this.decryptCredentialFields(
      tenantId,
      credentials,
      secretVars
    );

    if (credentials) await this.providerCredentialCacheService.setCredentials(providerCredentialCacheProps, credentials);
    return credentials;
  }

  private safeJsonParse<T>(raw: string, logPrefix: string): T | null {
    try {
      return JSON.parse(raw);
    } catch (e) {
      this.logger.error(`${logPrefix}: ${e}`);
      return null;
    }
  }

  private async decryptCredentialFields(
    tenantId: string,
    credentials: Record<string, any>,
    secretVars: string[]
  ): Promise<Record<string, any>> {

    const privateKeyPem = await this.storageService.load(`perms/${tenantId}`);
    const privateKeyContent = privateKeyPem.toString('utf-8');
    if (!privateKeyContent) {
      this.logger.error(`Private key not found, tenant_id: ${tenantId}`);
      throw new Error(`Private key not found`);
    }

    for (const key of secretVars) {
      if (!credentials[key]) {
        continue;
      }

      try {
        const buf = Buffer.from(credentials[key], 'utf8');
        credentials[key] = this.encryptionService.decrypt(buf, privateKeyContent);
      } catch (error) {
        this.logger.warn(`Failed to descrypt variable: ${key}`);
      }
    }

    return credentials;
  }
}
