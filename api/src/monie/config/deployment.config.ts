import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { toBoolean } from "../helpers/to-boolean";
import configuration from "@/config/configuration";

@Injectable()
export class DeploymentConfig {
    constructor(protected readonly configService: ConfigService
    ) { }

    applicationName(): string {
        return this.configService.get<string>('APPLICATION_NAME', configuration().defaultApplicationName);
    }

    debug(): boolean {
        return toBoolean(this.configService.get<boolean>('DEBUG', false))
    }

    enableRequestLogging(): boolean {
        return toBoolean(this.configService.get<boolean>('ENABLE_REQUEST_LOGGING', false))
    }

    // Saas edition: CLOUD（云端/多租户）, SELF_HOSTED（自托管/单租户）
    edition(): string {
        return this.configService.get<string>('EDITION', 'SELF_HOSTED')
    }

    deployEnvironment(): string {
        return this.configService.get<string>('DEPLY_ENVIRONMENT', 'PRODUCTION')
    }
}