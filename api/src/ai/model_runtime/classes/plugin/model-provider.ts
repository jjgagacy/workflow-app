import { PluginModelClientService } from "@/ai/plugin/services/plugin-model-client.service";
import { Injectable, NotImplementedException } from "@nestjs/common";
import { ModelType } from "../../enums/model-runtime.enum";
import { DefaultModel } from "../default-model.class";
import { ProviderModelBundle } from "../../entities/model.entity";
import { Provider } from "../provider.class";
import { ProviderModel } from "../provider-model.class";
import { ModelProvider } from "@/ai/plugin/dtos/model-provider.dto";

@Injectable()
export class PluginModelProvider {
  constructor(
    private readonly pluginModelClient: PluginModelClientService
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
    const modelProviders = await this.pluginModelClient.fetchModelProviders(tenantId);
    return modelProviders.map(modelProvider => {
      modelProvider.declaration.provider = modelProvider.pluginId + '/' + modelProvider.declaration.provider;
      if (!modelProvider.declaration.configMethods) {
        modelProvider.declaration.configMethods = [];
      }
      if (!modelProvider.declaration.models) {
        modelProvider.declaration.models = [];
      }
      return modelProvider.declaration;
    });
  }
}
