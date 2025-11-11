import { Module } from "@nestjs/common";
import { PluginClientService } from "./services/plugin-client.service";
import { MonieModule } from "@/monie/monie.module";
import { MonieConfig } from "@/monie/monie.config";
import { BasePluginClient } from "./classes/plugin-client";

@Module({
  imports: [MonieModule],
  providers: [PluginClientService, MonieConfig, BasePluginClient],
  exports: [PluginClientService],
})
export class PluginModule { }

