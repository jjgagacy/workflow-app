import { Global, Module } from "@nestjs/common";
import { MonieConfig } from "./monie.config";
import { SystemService } from "./system.service";
import { BasePluginClient } from "./classes/base-plugin-client";

@Global()
@Module({
    providers: [MonieConfig, SystemService, BasePluginClient],
    exports: [MonieConfig, SystemService, BasePluginClient],
})
export class MonieModule { } 
