import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { toBoolean } from "../helpers/to-boolean";
import { DefaultConfigValues } from "../constants/default-config-value";
import { getSafeNumber } from "../helpers/safe-number";

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
        const min = this.configService.get<number>('EMAIL_CODE_LOGIN_EXPIRY_MINUTES', DefaultConfigValues.EMAIL_CODE_LOGIN_EXPIRY_MINUTES);
        return getSafeNumber(min, DefaultConfigValues.EMAIL_CODE_LOGIN_EXPIRY_MINUTES);
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

    accessTokenExpiryMinutes(): number {
        const min = this.configService.get<number>('ACCESS_TOKEN_EXPIRY_MINUTES', DefaultConfigValues.ACCESS_TOKEN_EXPIRY_MINUTES);
        return getSafeNumber(min, DefaultConfigValues.ACCESS_TOKEN_EXPIRY_MINUTES);
    }

    refreshTokenExpiryDays(): number {
        const days = this.configService.get<number>('REFRESH_TOKEN_EXPIRY_DAYS', DefaultConfigValues.REFRESH_TOKEN_EXPIRY_DAYS);
        return getSafeNumber(days, DefaultConfigValues.REFRESH_TOKEN_EXPIRY_DAYS);
    }

    loginRetryDurationMinutes(): number {
        const min = this.configService.get<number>('LOGIN_RETRY_DURATION_MINUTES', DefaultConfigValues.LOGIN_RETRY_DURATION_MINUTES);
        return getSafeNumber(min, DefaultConfigValues.LOGIN_RETRY_DURATION_MINUTES);
    }

    forgotPasswordRetryDuration(): number {
        const min = this.configService.get<number>('FORGOT_PASSWORD_RETRY_DURATION_MINUTES', DefaultConfigValues.FORGOT_PASSWORD_RETRY_DURATION_MINUTES);
        return getSafeNumber(min, DefaultConfigValues.FORGOT_PASSWORD_RETRY_DURATION_MINUTES);
    }
}