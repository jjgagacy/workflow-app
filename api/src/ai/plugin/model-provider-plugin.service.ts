import { Provider, SimpleProvider } from "@/ai/model_runtime/classes/provider.class";
import { Injectable, NotImplementedException } from "@nestjs/common";
import { PluginModelClientService } from "./services/model-client.service";
import { ModelProvider } from "./dtos/model-provider.dto";
import { Credentials } from "../model_runtime/types/credentials.type";
import { ModelType } from "../model_runtime/enums/model-runtime.enum";
import { AIModel } from "../model_runtime/classes/ai-model.class";

@Injectable()
export class ModelProviderPluginService {
  constructor(
    private readonly pluginClient: PluginModelClientService
  ) { }

  async getModelProviders(tenantId: string, providerName?: string): Promise<ModelProvider[]> {
    return [];
  }

  async getProviders(tenantId: string): Promise<Provider[]> {
    return [];
  }

  async getProvider(tenantId: string, provider: string): Promise<Provider> {
    throw new NotImplementedException();
  }

  async providerCredentialsValidate(
    tenantId: string,
    providerName: string,
    credentials: Credentials
  ): Promise<Credentials> {
    throw new NotImplementedException();
  }

  async modelProviderCredentialsValidate(
    tenantId: string,
    providerName: string,
    model: string,
    modelType: ModelType,
    credentials: Credentials
  ): Promise<Credentials> {
    throw new NotImplementedException;
  }

  async getModelSchema(
    tenantId: string,
    providerName: string,
    model: string,
    modelType: ModelType,
    credentials: Credentials
  ): Promise<AIModel | null> {
    return null;
  }

  async getModels(
    tenantId: string,
    providerName?: string,
    modelType?: ModelType,
    credentials?: Credentials
  ): Promise<SimpleProvider[]> {
    throw new NotImplementedException();
  }

}

