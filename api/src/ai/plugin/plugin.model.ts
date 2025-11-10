import { Module } from "@nestjs/common";
import { PluginClientService } from "./services/plugin-client.service";

@Module({
  imports: [],
  providers: [PluginClientService],
  exports: [PluginClientService],
})
export class PluginModule { }

