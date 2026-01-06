import { AccountEntity } from "@/account/entities/account.entity";
import { QuotaConfiguration } from "@/ai/model_runtime/entities/quota.entity";
import { ModelType } from "@/ai/model_runtime/enums/model-runtime.enum";
import { CustomConfigurationStatus } from "@/ai/model_runtime/enums/quota.enum";
import { ProviderService } from "@/ai/model_runtime/services/provider.service";
import { EnumConverter } from "@/common/utils/enums";
import { DEFAULT_LANG } from "@/config/constants";
import { CustomConfiguration, ProviderInfo, ProviderList, QuotaInfo, RestrictModel, SystemConfiguration } from "@/graphql/model/model_provider/types/provider.type";
import { Injectable } from "@nestjs/common";

@Injectable()
export class ModelProviderService {
  constructor(
    private readonly providerService: ProviderService
  ) { }

  async getProviderList(
    tenantId: string,
    modelType?: string,
    language?: string,
  ): Promise<ProviderList> {
    const providerConfiguration = await this.providerService.getConfigurations(tenantId);
    const providerList: ProviderInfo[] = [];
    const lang = language || DEFAULT_LANG;
    for (const providerConf of providerConfiguration.values()) {
      if (modelType) {
        const modelTypeEnum = EnumConverter.toEnum(ModelType, modelType); if (!providerConf.provider.supportedModelTypes.includes(modelTypeEnum)) continue;
      }
      providerList.push({
        tenantId,
        providerName: providerConf.provider.provider,
        label: providerConf.provider.label[lang] || '',
        icon: providerConf.provider.iconSmall?.[lang] || '',
        supportedModelTypes: providerConf.provider.supportedModelTypes.map((v) => v as string),
        preferredProviderType: providerConf.preferredProviderType,
        customConfiguration: {
          status: providerConf.customConfigurationAvailable()
            ? CustomConfigurationStatus.ACTIVE
            : CustomConfigurationStatus.UNSUPPORTED
        } as CustomConfiguration,
        systemConfiguration: {
          enabled: providerConf.systemConfiguration.enabled,
          currentQuotaType: providerConf.systemConfiguration.currentQuotaType,
          quotaList: this.transQuotaConfigurationsToQuotaInfoList(
            providerConf.systemConfiguration.quotaConfiguration
          ),
        } as SystemConfiguration
      } as ProviderInfo);
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

