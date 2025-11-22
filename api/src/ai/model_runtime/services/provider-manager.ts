import { ProviderEntity } from "@/account/entities/provider.entity";
import { mergeMonieProviderName, ModelProviderID } from "@/ai/plugin/entities/provider-id.entities";
import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { DataSource, EntityManager, In, Repository } from "typeorm";
import { ProviderType } from "../enums/provider.enum";
import { Credentials } from "../types/credentials.type";
import { ProviderConfiguration } from "../classes/provider.configuration";
import { Transactional } from "@/common/decorators/transaction.decorator";
import { I18nService } from "nestjs-i18n";
import { I18nTranslations } from "@/generated/i18n.generated";
import { ProviderCredentialsCacheProps, ProviderCredentialsCacheService } from "./provider-credentials-cache.service";
import { CredentialsCacheType } from "../types/cache.type";
import { TenantPreferredProviderEntity } from "@/account/entities/tenant-preferred-provider.entity";
import { DatabaseRecordCreatedError } from "../entities/exceptions";
import { ProviderModelSettingEntity } from "@/account/entities/provider-model-setting.entity";
import { extractSecretVariables } from "../entities/form.entity";
import { EncryptionService } from "@/encryption/encryption.service";
import { TenantEntity } from "@/account/entities/tenant.entity";
import { HIDDEN_VALUE } from "@/config/constants";
import { StorageService } from "@/storage/storage.service";
import { GlobalLogger } from "@/logger/logger.service";

@Injectable()
export class ProviderManager {
  constructor(
    @InjectRepository(ProviderEntity)
    private readonly providerRepository: Repository<ProviderEntity>,
    @InjectRepository(TenantPreferredProviderEntity)
    private readonly preferredProviderEntityRepository: Repository<TenantPreferredProviderEntity>,
    @InjectRepository(ProviderModelSettingEntity)
    private readonly providerModelSettingEntityRepository: Repository<ProviderModelSettingEntity>,
    @InjectRepository(TenantEntity)
    private readonly tenantEntityRepository: Repository<TenantEntity>,
    private readonly dataSource: DataSource,
    private readonly i18n: I18nService<I18nTranslations>,
    private readonly credentialsCacheService: ProviderCredentialsCacheService,
    private readonly encryptionService: EncryptionService,
    private readonly storageService: StorageService,
    private readonly logger: GlobalLogger,
  ) { }

  async getCustomProviderCredentials(
    tenantId: string,
    providerName: string
  ): Promise<ProviderEntity | null> {
    const providerNames = mergeMonieProviderName(providerName);

    return await this.providerRepository.findOne({
      where: {
        tenant: { id: tenantId },
        providerType: ProviderType.CUSTOM,
        providerName: In(providerNames),
      }
    });
  }

  async getPreferredModelProvider(
    tenantId: string,
    providerName: string,
  ): Promise<TenantPreferredProviderEntity | null> {
    const providerNames = mergeMonieProviderName(providerName);

    return await this.preferredProviderEntityRepository.findOne({
      where: {
        tenant: { id: tenantId },
        providerName: In(providerNames),
      },
    });
  }

  async getProviderModelSetting(
    tenantId: string,
    providerName: string,
    modelName: string,
    modelType: string,
  ): Promise<ProviderModelSettingEntity | null> {
    const providerNames = mergeMonieProviderName(providerName);

    return await this.providerModelSettingEntityRepository.findOne({
      where: {
        tenant: { id: tenantId },
        providerName: In(providerNames),
        modelName,
        modelType,
      }
    });
  }

  async encryptToken(tenantId: string, token: string): Promise<string> {
    const tenant = await this.tenantEntityRepository.findOneBy({ id: tenantId });
    if (!tenant) throw new Error(`Failed to find tenant`);

    const encrypted = this.encryptionService.encrypt(token, tenant.encryptPublicKey!);
    return encrypted.toString('utf8');
  }

  async decryptToken(tenantId: string, encryptToken: string): Promise<string> {
    const privateKeyPem = await this.storageService.load(`perms/${tenantId}`);
    const privateKeyContent = privateKeyPem.toString('utf-8');
    if (!privateKeyContent) {
      this.logger.error(`Private key not found, tenant_id: ${tenantId}`);
      throw new Error(`Private key not found`);
    }
    const buf = Buffer.from(privateKeyContent);
    return this.encryptionService.decrypt(buf, privateKeyContent);
  }

  /**
   * validateCustomCredentials() validates and prepares custom provider credentials
   * submited by tenant.
   * It ensures that:
   *   - Secret fields (API keys, tokens...) are properly restored when the client 
   *     sends HIDDEN_VALUE
   *   - Credentials are decrypted, validated, and re-encrypted before using stored.
   *   - Existing saved provider configuration (if any) is reused correctly.
   *
   * Step-by-step:
   *   1. Fetch the existing provider record from the database.
   *   2. Identify whitch credential fields are secret.
   *      These fields require special handling such as decryption and re-encryption.
   *   3. Load and parse the existing encryption provider configuration.
   *   4. Restore secrets when the client sends HIDDEN_VALUE
   *   5. Validate the credentials using the provider implementation.
   *   6. Re-encrypt all secret fields for safe storage.
   */
  async validateCustomCredentials(
    providerConfiguration: ProviderConfiguration,
    credentials: Credentials,
  ): Promise<{ providerRecord?: ProviderEntity, credentials: Credentials }> {
    const providerRecord = await this.getCustomProviderCredentials(
      providerConfiguration.tenantId,
      providerConfiguration.provider.provider
    );
    const credentialsSecretVariables = extractSecretVariables(providerConfiguration.provider.providerCredentialSchema?.credentialFromSchemas || []);
    let originalCredentials: Credentials = {};
    if (providerRecord && providerRecord.encryptedConfig) {
      originalCredentials = JSON.parse(providerRecord.encryptedConfig);
    }
    // If request uses HIDDEN_VALUE for a secret field, restore original decrypted token
    for (const [key, value] of Object.entries(credentials)) {
      if (credentialsSecretVariables.includes(key)) {
        if (value === HIDDEN_VALUE && originalCredentials[key]) {
          credentials[key] = this.decryptToken(providerConfiguration.tenantId, originalCredentials[key]);
        }
      }
    }
    // todo validate 
    // todo validate 
    const validateCredentials = { ...credentials };
    for (const [key, value] of Object.entries(validateCredentials)) {
      if (credentialsSecretVariables.includes(key)) {
        validateCredentials[key] = this.encryptToken(providerConfiguration.tenantId, value);
      }
    }
    return { providerRecord: undefined, credentials: validateCredentials };
  }

  @Transactional()
  async addOrUpdateCustomCredentials(
    providerConfiguration: ProviderConfiguration,
    credentials: Credentials,
    entityManager?: EntityManager,
  ): Promise<ProviderEntity> {
    const workManager = entityManager || this.dataSource.manager;
    const validateResult = await this.validateCustomCredentials(providerConfiguration, credentials);
    let providerRecord = validateResult.providerRecord;
    const validatedCredentials = validateResult.credentials;
    const now = new Date();
    const updatedBy = 'updateCredentials';

    if (providerRecord) {
      await workManager.update(ProviderEntity, { id: providerRecord.id }, {
        operate: {
          ...providerRecord.operate,
          updatedAt: now,
          updatedBy,
        },
        encryptedConfig: JSON.stringify(validatedCredentials),
        isValid: true,
      });
    } else {
      providerRecord = workManager.create(ProviderEntity, {
        tenant: { id: providerConfiguration.tenantId },
        providerName: providerConfiguration.provider.provider,
        providerType: ProviderType.CUSTOM,
        encryptedConfig: JSON.stringify(validatedCredentials),
        isValid: true,
        operate: {
          createdAt: now,
          updatedAt: now,
          createdBy: updatedBy,
          updatedBy,
        }
      });
      await workManager.save(providerRecord);
      if (!providerRecord.id) throw new DatabaseRecordCreatedError(this.i18n.t('model.PROVIDER_CREATED_ERROR'));
    }

    // Delete credentials cache
    const providerCredentialsCacheProps = {
      tenantId: providerConfiguration.tenantId,
      identityId: providerRecord.id,
      cacheType: CredentialsCacheType.PROVIDER,
    } as ProviderCredentialsCacheProps;
    this.credentialsCacheService.delete(providerCredentialsCacheProps);

    this.switchPreferredProviderType(providerConfiguration, ProviderType.CUSTOM, workManager);
    return providerRecord;
  }

  @Transactional()
  async switchPreferredProviderType(
    providerConfiguration: ProviderConfiguration,
    providerType: ProviderType,
    entityManager?: EntityManager,
  ): Promise<void> {
    if (providerType === providerConfiguration.preferredProviderType) return;

    if (providerType === ProviderType.SYSTEM && !providerConfiguration.systemConfiguration.enabled)
      return;

    const workManager = entityManager || this.dataSource.manager;
    let preferredProviderEntity: TenantPreferredProviderEntity | null;
    preferredProviderEntity = await this.getPreferredModelProvider(
      providerConfiguration.tenantId,
      providerConfiguration.provider.provider,
    );

    if (preferredProviderEntity) {
      workManager.update(TenantPreferredProviderEntity, { id: preferredProviderEntity.id }, {
        updatedAt: new Date(),
        preferredProviderType: providerType,
      });
    } else {
      preferredProviderEntity = workManager.create(TenantPreferredProviderEntity, {
        tenant: { id: providerConfiguration.tenantId },
        providerName: providerConfiguration.provider.provider,
        preferredProviderType: providerType,
      });
      await workManager.save(preferredProviderEntity);
      if (!preferredProviderEntity.id) throw new DatabaseRecordCreatedError(`Failed create preferred provider`);
    }
  }

  @Transactional()
  private async createProviderModelSetting(
    tenantId: string,
    providerName: string,
    modelName: string,
    modelType: string,
    enabled: boolean,
    entityManager?: EntityManager,
  ): Promise<ProviderModelSettingEntity> {
    const workManager = entityManager || this.dataSource.manager;
    const setting = workManager.create(ProviderModelSettingEntity, {
      tenant: { id: tenantId },
      providerName,
      modelName,
      modelType,
      createdAt: new Date(),
      enabled
    });
    await workManager.save(setting);
    if (!setting.id) throw new DatabaseRecordCreatedError(`Failed to create provider model setting`);
    return setting;
  }

  @Transactional()
  async enableModel(
    tenantId: string,
    providerName: string,
    modelName: string,
    modelType: string,
    entityManager?: EntityManager,
  ): Promise<ProviderModelSettingEntity> {
    const workManager = entityManager || this.dataSource.manager;
    let setting = await this.getProviderModelSetting(tenantId, providerName, modelName, modelType);
    const now = new Date();
    if (setting) {
      workManager.update(ProviderModelSettingEntity, { id: setting.id }, {
        enabled: true,
        updatedAt: now,
      });
    } else {
      setting = await this.createProviderModelSetting(tenantId, providerName, modelName, modelType, true);
    }
    return setting;
  }

  @Transactional()
  async disableModel(
    tenantId: string,
    providerName: string,
    modelName: string,
    modelType: string,
    entityManager?: EntityManager,
  ): Promise<ProviderModelSettingEntity> {
    const workManager = entityManager || this.dataSource.manager;
    let setting = await this.getProviderModelSetting(tenantId, providerName, modelName, modelType);
    const now = new Date();
    if (setting) {
      workManager.update(ProviderModelSettingEntity, { id: setting.id }, {
        enabled: false,
        updatedAt: now,
      });
    } else {
      setting = await this.createProviderModelSetting(tenantId, providerName, modelName, modelType, false);
    }
    return setting;
  }

  @Transactional()
  async deleteCustomCredentials(
    providerConfiguration: ProviderConfiguration,
    entityManager?: EntityManager,
  ): Promise<void> {
    const providerRecord = await this.getCustomProviderCredentials(
      providerConfiguration.tenantId,
      providerConfiguration.provider.provider
    );
    if (!providerRecord) return;

    const workManager = entityManager || this.dataSource.manager;

    this.switchPreferredProviderType(providerConfiguration, ProviderType.SYSTEM, workManager);

    await workManager.remove(providerRecord);

    // delete credentials cache
    const credentialsCacheProps = {
      tenantId: providerConfiguration.tenantId,
      identityId: providerRecord.id,
      cacheType: CredentialsCacheType.PROVIDER,
    } as ProviderCredentialsCacheProps;
    this.credentialsCacheService.delete(credentialsCacheProps);
  }

}
