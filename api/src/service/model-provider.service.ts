import { QuotaConfiguration } from "@/ai/model_runtime/entities/quota.entity";
import { ModelType } from "@/ai/model_runtime/enums/model-runtime.enum";
import { CustomConfigurationStatus } from "@/ai/model_runtime/enums/quota.enum";
import { ProviderService } from "@/ai/model_runtime/services/provider.service";
import { EnumConverter } from "@/common/utils/enums";
import { CustomConfiguration, ModelProviderInfo, ModelProviderList, QuotaInfo, RestrictModel, SystemConfiguration } from "@/graphql/model/model_provider/types/provider.type";
import { Injectable } from "@nestjs/common";
import { MarketplaceService } from "./marketplace.service";

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
    for (const pc of providerConfiguration.values()) {
      if (modelType) {
        const modelTypeEnum = EnumConverter.toEnum(ModelType, modelType);
        if (!pc.provider.supportedModelTypes.includes(modelTypeEnum)) continue;
      }
      const providerName = pc.provider.provider.split('/').slice(-1)[0];
      providerList.push({
        tenantId,
        providerName: pc.provider.provider,
        label: pc.provider.label || {},
        description: pc.provider.description,
        icon: {
          en_US: this.marketplaceService.getModelProviderIconUrl(providerName),
          zh_Hans: this.marketplaceService.getModelProviderIconUrl(providerName, 'light', 'zh_Hans'),
        },
        iconDark: {
          en_US: this.marketplaceService.getModelProviderIconUrl(providerName, 'dark'),
          zh_Hans: this.marketplaceService.getModelProviderIconUrl(providerName, 'dark', 'zh_Hans'),
        },
        supportedModelTypes: pc.provider.supportedModelTypes.map((v) => v as string),
        preferredProviderType: pc.preferredProviderType,
        customConfiguration: {
          status: pc.customConfigurationAvailable()
            ? CustomConfigurationStatus.ACTIVE
            : CustomConfigurationStatus.UNSUPPORTED
        } as CustomConfiguration,
        systemConfiguration: {
          enabled: pc.systemConfiguration.enabled,
          currentQuotaType: pc.systemConfiguration.currentQuotaType,
          quotaList: this.transQuotaConfigurationsToQuotaInfoList(
            pc.systemConfiguration.quotaConfiguration
          ),
        } as SystemConfiguration,
        providerCredentialSchema: pc.provider.providerCredentialSchema,
        modelCredentialSchema: pc.provider.modelCredentialSchema,
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
}

