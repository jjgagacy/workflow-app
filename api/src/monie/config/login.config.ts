import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { toBoolean } from "../helpers/to-boolean";

@Injectable()
export class LoginConfig {
    constructor(protected readonly configService: ConfigService
    ) { }

    enableEmailCodeLogin(): boolean {
        return toBoolean(this.configService.get<boolean>('ENABLE_EMAIL_CODE_LOGIN', false))
    }

    enableEmailPasswordLogin(): boolean {
        return toBoolean(this.configService.get<boolean>('ENABLE_EMAIL_PASSWORD_LOGIN', false))
    }

    emailCodeLoginExpiryMinutes(): number {
        const min = this.configService.get<number>('EMAIL_CODE_LOGIN_EXPIRY_MINUTES', 5)
        return Number(min)
    }

    enableSocialOauthLogin(): boolean {
        return toBoolean(this.configService.get<boolean>('ENABLE_SOCIAL_OAUTH_LOGIN', false))
    }

    allowRegister(): boolean {
        return toBoolean(this.configService.get<boolean>('ALLOW_REGISTER', false))
    }

    allowCreateWorkspace(): boolean {
        return toBoolean(this.configService.get<boolean>('ALLOW_CREATE_WORKSPACE', false))
    }
}