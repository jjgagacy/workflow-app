import { Module } from "@nestjs/common";
import { PluginModelClientService } from "./services/plugin-model-client.service";
import { MonieModule } from "@/monie/monie.module";
import { MonieConfig } from "@/monie/monie.config";
import { BasePluginClient } from "../../monie/classes/base-plugin-client";
import { HostConfiguration } from "./services/host-configuration";
import { PluginInstallerService } from "./services/plugin-installer.service";

@Module({
  imports: [MonieModule],
  providers: [
    PluginModelClientService,
    MonieConfig,
    BasePluginClient,
    HostConfiguration,
    PluginInstallerService,
  ],
  exports: [
    PluginModelClientService,
    HostConfiguration,
    PluginInstallerService,
  ],
})
export class PluginModule { }

