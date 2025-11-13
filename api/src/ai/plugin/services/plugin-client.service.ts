import { Injectable } from "@nestjs/common";
import { ModelProviderDto } from "../dtos/model-provider.dto";

@Injectable()
export class PluginClientService {
  constructor() { }

  async getModelProviders(tenantId: string): Promise<ModelProviderDto[]> {
    return [];
  }
}

