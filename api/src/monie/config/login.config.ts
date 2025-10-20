import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { toBoolean } from "../helpers/to-boolean";
import { defaultConfigValues } from "../constants/default-config-value";
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
        const min = this.configService.get<number>('EMAIL_CODE_LOGIN_EXPIRY_MINUTES', defaultConfigValues.EMAIL_CODE_LOGIN_EXPIRY_MINUTES);
        return getSafeNumber(min, defaultConfigValues.EMAIL_CODE_LOGIN_EXPIRY_MINUTES);
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
        const min = this.configService.get<number>('ACCESS_TOKEN_EXPIRY_MINUTES', defaultConfigValues.ACCESS_TOKEN_EXPIRY_MINUTES);
        return getSafeNumber(min, defaultConfigValues.ACCESS_TOKEN_EXPIRY_MINUTES);
    }

    refreshTokenExpiryDays(): number {
        const days = this.configService.get<number>('REFRESH_TOKEN_EXPIRY_DAYS', defaultConfigValues.REFRESH_TOKEN_EXPIRY_DAYS);
        return getSafeNumber(days, defaultConfigValues.REFRESH_TOKEN_EXPIRY_DAYS);
    }

    loginRetryDurationMinutes(): number {
        const min = this.configService.get<number>('LOGIN_RETRY_DURATION_MINUTES', defaultConfigValues.LOGIN_RETRY_DURATION_MINUTES);
        return getSafeNumber(min, defaultConfigValues.LOGIN_RETRY_DURATION_MINUTES);
    }

    forgotPasswordRetryDuration(): number {
        const min = this.configService.get<number>('FORGOT_PASSWORD_RETRY_DURATION_MINUTES', defaultConfigValues.FORGOT_PASSWORD_RETRY_DURATION_MINUTES);
        return getSafeNumber(min, defaultConfigValues.FORGOT_PASSWORD_RETRY_DURATION_MINUTES);
    }
}