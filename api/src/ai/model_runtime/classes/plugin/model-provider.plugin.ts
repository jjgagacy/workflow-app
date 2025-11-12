import { PluginClientService } from "@/ai/plugin/services/plugin-client.service";
import { Injectable, NotImplementedException } from "@nestjs/common";
import { ModelType } from "../../enums/model-runtime.enum";
import { DefaultModel } from "../default-model.class";
import { ProviderConfiguration } from "../provider.configuration";
import { ProviderModelBundle } from "../../entities/model.entity";
import { Provider } from "../provider.class";
import { ProviderModel } from "../provider-model.class";
import { TenantPreferredProviderEntity } from "@/account/entities/tenant-preferred-provider.entity";
import { ProviderModelSettingEntity } from "@/account/entities/provider-model-setting.entity";

@Injectable()
export class ModelProviderPlugin {
  constructor(
    private readonly pluginClientService: PluginClientService
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

  private async getAllProvider(tenantId: string): Promise<Map<string, Provider[]>> {
    throw new NotImplementedException();
  }

  private async getAllProviderModels(tenantId: string): Promise<Map<string, ProviderModel[]>> {
    throw new NotImplementedException();
  }

  private async getPreferredModelProviders(tenantId: string): Promise<Map<string, TenantPreferredProviderEntity>> {
    throw new NotImplementedException();
  }

  private async getAllProviderModelSettings(tenantId: string): Promise<Map<string, ProviderModelSettingEntity[]>> {
    throw new NotImplementedException();
  }

  private async initTrialProvider(tenantId: string, providerNameToProviderMaps: Map<string, Provider[]>): Promise<Map<string, Provider[]>> {
    throw new NotImplementedException();
  }

}
