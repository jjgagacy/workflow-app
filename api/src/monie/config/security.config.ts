import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { DefaultConfigValues } from "../constants/default-config-value";
import { getSafeNumber } from "../helpers/safe-number";
import { toBoolean } from "../helpers/to-boolean";

@Injectable()
export class SecurityConfig {
    constructor(protected readonly configService: ConfigService
    ) { }

    // SecretKey for secure session cookie signing. Generate a strong 
    // key using `openssl rand -base64 42`
    secretKey(): string {
        return this.configService.get<string>('SECRET_KEY', '');
    }

    resetPasswordTokenExpiryMinutes(): number {
        const min = this.configService.get<number>('RESET_PASSWORD_TOKEN_EXPIRY_MINUTES', DefaultConfigValues.RESET_PASSWORD_TOKEN_EXPIRY_MINUTES);
        return getSafeNumber(min, DefaultConfigValues.RESET_PASSWORD_TOKEN_EXPIRY_MINUTES);
    }

    emailCodeLoginExpiryMinutes(): number {
        const min = this.configService.get<number>('EMAIL_CODE_LOGIN_EXPIRY_MINUTES', DefaultConfigValues.EMAIL_CODE_LOGIN_EXPIRY_MINUTES);
        return getSafeNumber(min, DefaultConfigValues.EMAIL_CODE_LOGIN_EXPIRY_MINUTES);
    }

    changeEmailTokenExpiryMinutes(): number {
        const min = this.configService.get<number>('CHANGE_EMAIL_TOKEN_EXPIRY_MINUTES', DefaultConfigValues.CHANGE_EMAIL_TOKEN_EXPIRY_MINUTES);
        return getSafeNumber(min, DefaultConfigValues.CHANGE_EMAIL_TOKEN_EXPIRY_MINUTES);
    }

    accountDeletionTokenExpiryMinutes(): number {
        const min = this.configService.get<number>('ACCOUNT_DELETION_TOKEN_EXPIRY_MINUTES', DefaultConfigValues.ACCOUNT_DELETION_TOKEN_EXPIRY_MINUTES);
        return getSafeNumber(min, DefaultConfigValues.ACCOUNT_DELETION_TOKEN_EXPIRY_MINUTES);
    }

    loginCheckDisabled(): boolean {
        return toBoolean(this.configService.get<boolean>('LOGIN_CHECK_DISABLED'));
    }

    adminApiKeyDisabled(): boolean {
        return toBoolean(this.configService.get<boolean>('ADMIN_API_KEY_DISABLED'));
    }

    adminApiKey(): string | undefined {
        return this.configService.get<string>('ADMIN_API_KEY');
    }
}