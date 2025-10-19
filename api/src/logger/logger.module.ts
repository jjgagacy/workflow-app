import { Global, Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { GlobalLogger } from "./logger.service";

@Global()
@Module({
    imports: [ConfigModule],
    providers: [GlobalLogger],
    exports: [GlobalLogger],
})
export class LoggerModel { }
