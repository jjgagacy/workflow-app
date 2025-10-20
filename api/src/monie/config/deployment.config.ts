import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { toBoolean } from "../helpers/to-boolean";

@Injectable()
export class DeploymentConfig {
    constructor(protected readonly configService: ConfigService
    ) { }

    applicationName(): string {
        return this.configService.get<string>('APPLICATION_NAME', 'monie/workflow')
    }

    debug(): boolean {
        return toBoolean(this.configService.get<boolean>('DEBUG', false))
    }

    enableRequestLogging(): boolean {
        return toBoolean(this.configService.get<boolean>('ENABLE_REQUEST_LOGGING', false))
    }

    edition(): string {
        return this.configService.get<string>('EDITION', 'SELF_HOSTED')
    }

    deployEnvironment(): string {
        return this.configService.get<string>('DEPLY_ENVIRONMENT', 'PRODUCTION')
    }
}