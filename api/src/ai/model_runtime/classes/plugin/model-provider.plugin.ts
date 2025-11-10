import { PluginClientService } from "@/ai/plugin/services/plugin-client.service";
import { Injectable } from "@nestjs/common";

@Injectable()
export class ModelProviderPlugin {
  constructor(
    private readonly pluginClientService: PluginClientService
  ) { }


}
