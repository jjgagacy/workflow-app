import { Injectable } from "@nestjs/common";
import { MonieConfig } from "./monie.config";

@Injectable()
export class SystemService {
    pluginMaxPackageSize: number;
    enableEmailCodeLogin: boolean;
    enableEmailPasswordLogin: boolean;
    allowRegister: boolean;
    allowCreateWorkspace: boolean;
    applicationName: string;
    debug: boolean;
    enableRequestLogging: boolean;
    edition: string;
    deployEnvironment: string;
    emailCodeLoginExpiryMinutes: number;
    enableSocialOauthLogin: boolean;
    accessTokenExpiryMinutes: number;
    refreshTokenExpiryDays: number;
    loginRetryDurationMinutes: number;
    forgotPasswordRetryDuration: number;
    billingEnabled: boolean;
    enterpriseEnabled: boolean;
    canReplaceLogo: boolean;
    enableChangeEmail: boolean;

    constructor(
        private readonly monieConfig: MonieConfig
    ) {
        this.pluginMaxPackageSize = this.monieConfig.pluginMaxPackageSize();
        this.enableEmailCodeLogin = this.monieConfig.enableEmailCodeLogin();
        this.enableEmailPasswordLogin = this.monieConfig.enableEmailPasswordLogin();
        this.allowRegister = this.monieConfig.allowRegister();
        this.allowCreateWorkspace = this.monieConfig.allowCreateWorkspace();
        this.applicationName = this.monieConfig.applicationName();
        this.debug = this.monieConfig.debug();
        this.edition = this.monieConfig.edition();
        this.deployEnvironment = this.monieConfig.deployEnvironment();
        this.emailCodeLoginExpiryMinutes = this.monieConfig.emailCodeLoginExpiryMinutes();
        this.enableSocialOauthLogin = this.monieConfig.enableSocialOauthLogin();
        this.accessTokenExpiryMinutes = this.monieConfig.accessTokenExpiryMinutes();
        this.refreshTokenExpiryDays = this.monieConfig.refreshTokenExpiryDays();
        this.loginRetryDurationMinutes = this.monieConfig.loginRetryDurationMinutes();
        this.forgotPasswordRetryDuration = this.monieConfig.forgotPasswordRetryDuration();
        this.billingEnabled = this.monieConfig.billingEnabled();
        this.enterpriseEnabled = this.monieConfig.enterpriseEnabled();
        this.canReplaceLogo = this.monieConfig.canReplaceLogo();
        this.enableChangeEmail = this.monieConfig.enableChangeEmail();
    }
}