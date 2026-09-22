import { QuotaConfiguration } from "@/ai/model_runtime/entities/quota.entity";
import { FetchFrom, ModelType } from "@/ai/model_runtime/enums/model-runtime.enum";
import { CustomConfigurationStatus } from "@/ai/model_runtime/enums/quota.enum";
import { ProviderService } from "@/ai/model_runtime/services/provider.service";
import { EnumConverter } from "@/common/utils/enums";
import { CustomConfiguration, ModelProviderInfo, ModelProviderList, ModelProviderModelsResponse, QuotaInfo, RestrictModel, SystemConfiguration } from "@/graphql/model/model_provider/types/provider.type";
import { Injectable } from "@nestjs/common";
import { MarketplaceService } from "./marketplace.service";
import { ModelCredentialResponse, ProviderCredentialResponse } from "@/graphql/workspace/types/provider.type";
import { PluginModelProvider } from "@/ai/model_runtime/classes/plugin/model-provider";
import { ProviderID } from "@/ai/plugin/entities/provider-id.entities";

@Injectable()
export class ModelProviderService {
  constructor(
    private readonly providerService: ProviderService,
    private readonly marketplaceService: MarketplaceService,
    private readonly pluginModelProvider: PluginModelProvider
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
      const pluginId = new ProviderID(config.provider.provider).pluginId;
      providerList.push({
        tenantId,
        providerName: config.provider.provider,
        label: config.provider.label || {},
        description: config.provider.description,
        ...this.getAllIconObject(pluginId),
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

  public async getProviderCredentials(tenantId: string, providerName: string, obfuscated: boolean = true): Promise<ProviderCredentialResponse> {
    const providerConfiguration = await this.providerService.getConfigurations(tenantId);
    const providerConfig = providerConfiguration.get(providerName);
    if (!providerConfig) {
      throw new Error(`Provider configuration not found for provider: ${providerName}`);
    }
    const credentials = providerConfig.getCustomCredentials(obfuscated);
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

  public async getModelsByModelType(tenantId: string, modelType?: string): Promise<ModelProviderModelsResponse[]> {
    const allModelProviderDeclarations = await this.pluginModelProvider.getAllModelProviders(tenantId);
    const providerConfiguration = await this.providerService.getConfigurations(tenantId);
    const models = await providerConfiguration.getModels(
      modelType ? EnumConverter.toEnum(ModelType, modelType) : undefined,
      '',
      allModelProviderDeclarations
    );

    const modelsByProvider = new Map<string, typeof models>();
    for (const model of models) {
      const providerName = model.provider.provider;
      const providerModels = modelsByProvider.get(providerName) ?? [];
      providerModels.push(model);
      modelsByProvider.set(providerName, providerModels);
    }

    const modelProviderModelsResponse: ModelProviderModelsResponse[] = [];
    for (const [providerName, providerModels] of modelsByProvider) {
      // Skip providers without any models left after filtering.
      if (providerModels.length === 0) continue;
      const pluginId = new ProviderID(providerName).pluginId;

      modelProviderModelsResponse.push({
        tenantId,
        providerName,
        ...this.getAllIconObject(pluginId),
        label: providerModels[0].provider.label,
        status: CustomConfigurationStatus.ACTIVE,
        models: providerModels.map(m => ({
          model: m.model,
          label: m.label,
          modelType: m.modelType,
          features: m.features,
          fetchFrom: m.fetchFrom || FetchFrom.PREDEFINED_MODEL,
          modelProperties: m.modelProperties,
          deprecated: m.deprecated,
          provider: m.provider.provider,
          status: m.status,
        })),
      } as ModelProviderModelsResponse);
    }

    return modelProviderModelsResponse;
  }

  getAllIconObject(pluginId: string) {
    return {
      icon: {
        en_US: this.marketplaceService.getModelProviderIconUrl(pluginId),
        zh_Hans: this.marketplaceService.getModelProviderIconUrl(pluginId, 'light', 'zh_Hans'),
      },
      iconDark: {
        en_US: this.marketplaceService.getModelProviderIconUrl(pluginId, 'dark'),
        zh_Hans: this.marketplaceService.getModelProviderIconUrl(pluginId, 'dark', 'zh_Hans'),
      },
      iconSmall: {
        en_US: this.marketplaceService.getModelProviderIconUrl(pluginId, 'light', 'en_US', true),
        zh_Hans: this.marketplaceService.getModelProviderIconUrl(pluginId, 'light', 'zh_Hans', true),
      },
      iconSmallDark: {
        en_US: this.marketplaceService.getModelProviderIconUrl(pluginId, 'dark', undefined, true),
        zh_Hans: this.marketplaceService.getModelProviderIconUrl(pluginId, 'dark', 'zh_Hans', true),
      },
    };
  }
}
