import { Module } from "@nestjs/common";
import { PluginModelClientService } from "./services/model-client.service";
import { MonieModule } from "@/monie/monie.module";
import { MonieConfig } from "@/monie/monie.config";
import { BasePluginClient } from "../../monie/classes/base-plugin-client";
import { HostConfiguration } from "./services/host-configuration";

@Module({
  imports: [MonieModule],
  providers: [
    PluginModelClientService,
    MonieConfig,
    BasePluginClient,
    HostConfiguration,
  ],
  exports: [
    PluginModelClientService,
    HostConfiguration
  ],
})
export class PluginModule { }

