import { QuotaConfiguration } from "@/ai/model_runtime/entities/quota.entity";
import { ModelType } from "@/ai/model_runtime/enums/model-runtime.enum";
import { CustomConfigurationStatus } from "@/ai/model_runtime/enums/quota.enum";
import { ProviderService } from "@/ai/model_runtime/services/provider.service";
import { EnumConverter } from "@/common/utils/enums";
import { CustomConfiguration, ModelProviderInfo, ModelProviderList, ModelProviderModelList, QuotaInfo, RestrictModel, SystemConfiguration } from "@/graphql/model/model_provider/types/provider.type";
import { Injectable } from "@nestjs/common";
import { MarketplaceService } from "./marketplace.service";
import { ModelCredentialResponse, ProviderCredentialResponse } from "@/graphql/workspace/types/provider.type";

@Injectable()
export class ModelProviderService {
  constructor(
    private readonly providerService: ProviderService,
    private readonly marketplaceService: MarketplaceService
  ) { }

  async getProviderList(
    tenantId: string,
    modelType?: string,
  ): Promise<ModelProviderList> {
    const providerConfiguration = await this.providerService.getConfigurations(tenantId);
    const providerList: ModelProviderInfo[] = [];
    for (const config of providerConfiguration.values()) {
      if (modelType) {
        const modelTypeEnum = EnumConverter.toEnum(ModelType, modelType);
        if (!config.provider.supportedModelTypes.includes(modelTypeEnum)) continue;
      }
      const providerName = config.provider.provider.split('/').slice(-1)[0];
      providerList.push({
        tenantId,
        providerName: config.provider.provider,
        label: config.provider.label || {},
        description: config.provider.description,
        icon: {
          en_US: this.marketplaceService.getModelProviderIconUrl(providerName),
          zh_Hans: this.marketplaceService.getModelProviderIconUrl(providerName, 'light', 'zh_Hans'),
        },
        iconDark: {
          en_US: this.marketplaceService.getModelProviderIconUrl(providerName, 'dark'),
          zh_Hans: this.marketplaceService.getModelProviderIconUrl(providerName, 'dark', 'zh_Hans'),
        },
        supportedModelTypes: config.provider.supportedModelTypes.map((v) => v as string),
        preferredProviderType: config.preferredProviderType,
        customConfiguration: {
          status: config.customConfigurationAvailable()
            ? CustomConfigurationStatus.ACTIVE
            : CustomConfigurationStatus.UNSUPPORTED
        } as CustomConfiguration,
        systemConfiguration: {
          enabled: config.systemConfiguration.enabled,
          currentQuotaType: config.systemConfiguration.currentQuotaType,
          quotaList: this.transQuotaConfigurationsToQuotaInfoList(
            config.systemConfiguration.quotaConfiguration
          ),
        } as SystemConfiguration,
        providerCredentialSchema: config.provider.providerCredentialSchema,
        modelCredentialSchema: config.provider.modelCredentialSchema,
      } as ModelProviderInfo);
    }

    return { data: providerList };
  }

  private transQuotaConfigurationsToQuotaInfoList(quotaList: QuotaConfiguration[]): QuotaInfo[] {
    return quotaList.map((quota) => {
      return {
        quotaType: quota.quotaType,
        quotaUnit: quota.quotaUnit,
        quotaLimit: quota.quotaLimit,
        quotaUsed: quota.quotaUsed,
        restrictModels: quota.restrictModel?.map((model) => {
          return {
            modelName: model.model,
            modelType: model.modelType,
            baseModelName: model.baseModel,
          } as RestrictModel
        }),
      } as QuotaInfo;
    });
  }

  public async getProviderCredentials(tenantId: string, providerName: string): Promise<ProviderCredentialResponse> {
    const providerConfiguration = await this.providerService.getConfigurations(tenantId);
    const providerConfig = providerConfiguration.get(providerName);
    if (!providerConfig) {
      throw new Error(`Provider configuration not found for provider: ${providerName}`);
    }
    const credentials = providerConfig.getCustomCredentials(true);
    return {
      providerName,
      credentials,
    } as ProviderCredentialResponse;
  }

  public async getModelCredentials(tenantId: string, providerName: string, model: string, modelType: string): Promise<ModelCredentialResponse> {
    const providerConfiguration = await this.providerService.getConfigurations(tenantId);
    const providerConfig = providerConfiguration.get(providerName);
    if (!providerConfig) {
      throw new Error(`Provider configuration not found for provider: ${providerName}`);
    }
    const credentials = providerConfig.getCustomModelCredentials(model, EnumConverter.toEnum(ModelType, modelType), true);
    return {
      providerName,
      model,
      modelType,
      credentials,
    } as ModelCredentialResponse;
  }

  public async saveProviderCredentials(tenantId: string, providerName: string, credentials: Record<string, any>): Promise<boolean> {
    const providerConfiguration = await this.providerService.getConfigurations(tenantId);
    const providerConfig = providerConfiguration.get(providerName);
    if (!providerConfig) {
      throw new Error(`Provider configuration not found for provider: ${providerName}`);
    }
    await providerConfig.upsertCustomCredentials(credentials);
    return true;
  }

  public async getModelByModelType(tenantId: string, modelType: string): Promise<ModelProviderModelList[]> {
    // Implement the logic to fetch models by modelType
    // This is a placeholder implementation and should be replaced with actual logic
    const providerConfiguration = await this.providerService.getConfigurations(tenantId);
    const models = providerConfiguration.getModels('', EnumConverter.toEnum(ModelType, modelType));

    // todo: 

    return [];
  }
}
