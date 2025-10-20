import { Global, Module } from "@nestjs/common";
import { MonieConfig } from "./monie.config";
import { SystemService } from "./system.service";

@Global()
@Module({
    providers: [MonieConfig, SystemService],
    exports: [MonieConfig, SystemService],
})
export class MonieModule { } 
