import { Global, Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { GlobalLogger } from "./logger.service";
import { WinstonLogger } from "./winston.service";

@Global()
@Module({
    imports: [ConfigModule],
    providers: [GlobalLogger, WinstonLogger],
    exports: [GlobalLogger, WinstonLogger],
})
export class LoggerModule { }
