import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { toBoolean } from "../helpers/to-boolean";

@Injectable()
export class EnterpriseConfig {
    constructor(protected readonly configService: ConfigService
    ) { }

    enterpriseEnabled(): boolean {
        return toBoolean(this.configService.get<boolean>('ENTERPRISE_ENABLED', false))
    }

    canReplaceLogo(): boolean {
        return toBoolean(this.configService.get<boolean>('CAN_REPLACE_LOGO', false))
    }
}