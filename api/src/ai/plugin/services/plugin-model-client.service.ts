import { Injectable, NotImplementedException } from "@nestjs/common";
import { BasePluginClient } from "../../../monie/classes/base-plugin-client";
import { Provider, SimpleProvider } from "@/ai/model_runtime/classes/provider.class";
import { ModelProvider } from "../dtos/model-provider.dto";
import { Credentials } from "../../model_runtime/types/credentials.type";
import { ModelType } from "../../model_runtime/enums/model-runtime.enum";
import { AIModel } from "../../model_runtime/classes/ai-model.class";

@Injectable()
export class PluginModelClientService {
  constructor(
    private readonly baseClient: BasePluginClient
  ) { }

  async fetchModelProviders(tenantId: string): Promise<ModelProvider[]> {
    return new Promise((resolve, reject) => {
      this.baseClient.requestWithPluginDaemonResponse(
        'GET',
        `plugin/${tenantId}/management/models`,
        {
          params: { page: "1", page_size: "256" }
        }
      ).subscribe({
        next: (response) => resolve(response),
        error: (error) => reject(error)
      });
    });
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
