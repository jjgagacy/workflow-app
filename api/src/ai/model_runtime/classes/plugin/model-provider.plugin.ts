import { PluginModelClientService } from "@/ai/plugin/services/model-client.service";
import { Injectable, NotImplementedException } from "@nestjs/common";
import { ModelType } from "../../enums/model-runtime.enum";
import { DefaultModel } from "../default-model.class";
import { ProviderConfiguration } from "../provider.configuration";
import { ProviderModelBundle } from "../../entities/model.entity";
import { Provider } from "../provider.class";
import { ProviderModel } from "../provider-model.class";
import { TenantPreferredProviderEntity } from "@/account/entities/tenant-preferred-provider.entity";
import { ProviderModelSettingEntity } from "@/account/entities/provider-model-setting.entity";
import { ProviderEntity } from "@/account/entities/provider.entity";

@Injectable()
export class ModelProviderPlugin {
  constructor(
    private readonly pluginClientService: PluginModelClientService
  ) { }

  async getDefaultModel(tenantId: string, modelType: ModelType): Promise<DefaultModel | null> {
    return null;
  }

  async getProviderModelBundle(
    tenantId: string,
    provider: string,
    modelType: ModelType
  ): Promise<ProviderModelBundle> {
    throw new NotImplementedException();
  }

  async getAllProviderModels(tenantId: string): Promise<Map<string, ProviderModel[]>> {
    throw new NotImplementedException();
  }

  async getAllProviders(tenantId: string): Promise<Provider[]> {
    return [];
  }

}
