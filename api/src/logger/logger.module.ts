import { Global, Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { GlobalLogger } from "./logger.service";
import { WinstonLogger } from "./winston.service";
import { MonieConfig } from "@/monie/monie.config";
import { MonieModule } from "@/monie/monie.module";

@Global()
@Module({
    imports: [ConfigModule, MonieModule],
    providers: [GlobalLogger, WinstonLogger],
    exports: [GlobalLogger, WinstonLogger],
})
export class LoggerModule { }
