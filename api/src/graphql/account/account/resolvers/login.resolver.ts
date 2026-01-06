import { Args, Mutation, Resolver, Query } from "@nestjs/graphql";
import { AccountService } from "@/account/account.service";
import { LoginResponse, UserInfoResponse } from "../types/login-response.type";
import { EmailCodeLoginInput, EmailCodeLoginSendEmail, LoginInput, ResetPasswordSendEmailInput } from "../types/login-input.type";
import { AuthService } from "@/auth/auth.service";
import { CurrentUser } from "@/common/decorators/current-user";
import { NotFoundException, Req, UseGuards } from "@nestjs/common";
import { GqlAuthGuard } from "@/common/guards/gql-auth.guard";
import { AuthAccountService } from "@/service/auth-account.service";
import { DeviceService } from "@/service/libs/device.service";
import { Request } from "express";
import { EnableEmailPasswordLoginGuard } from "@/common/guards/auth/enable-email-password-login.guard";
import { EmailInFreezeError } from "@/service/exceptions/account.error";
import { I18nService } from "nestjs-i18n";
import { I18nTranslations } from "@/generated/i18n.generated";
import { FeatureService } from "@/service/feature.service";
import { EnumConverter } from "@/common/utils/enums";
import { EmailLanguage } from "@/mail/mail-i18n.service";

@Resolver()
export class LoginResolver {
    constructor(
        private readonly accountService: AccountService,
        private readonly authService: AuthService,
        private readonly authAccountService: AuthAccountService,
        private readonly deviceService: DeviceService,
        private readonly i18n: I18nService<I18nTranslations>,
        private readonly featureService: FeatureService,
    ) { }

    @Mutation(() => LoginResponse)
    async login(@Args('input') input: LoginInput): Promise<LoginResponse> {
        return this.authService
            .validateUser(input.username, input.password)
            .then(user => {
                return this.authService.login(user)
            });
    }

    @UseGuards(GqlAuthGuard)
    @Query(() => UserInfoResponse)
    async currentUser(@CurrentUser() user: any): Promise<UserInfoResponse> {
        return {
            id: user.id,
            name: user.name
        };
    }

    @Mutation(() => LoginResponse)
    async emailCodeLogin(@Args('input') input: EmailCodeLoginInput, @Req() req: Request): Promise<LoginResponse> {
        const deviceInfo = this.deviceService.getDeviceInfo(req.headers['user-agent'] || '', req.headers['accept-language']);
        return this.authAccountService
            .validateEmailCodeLogin(input.email, input.token, input.code, deviceInfo.language)
            .then(async (user) => {
                if (await this.authAccountService.isAccountFreezed(input.email)) {
                    throw EmailInFreezeError.create(this.i18n);
                }
                return this.authService.login(user)
            });
    }

    @Mutation(() => String)
    async emailCodeLoginSendEmail(@Args('input') input: EmailCodeLoginSendEmail, @Req() req: Request): Promise<string> {
        const deviceInfo = this.deviceService.getDeviceInfo(req.headers['user-agent'] || '', req.headers['accept-language']);

        const language = input.language || deviceInfo.language;
        const emailLanguage = EnumConverter.toEnum(EmailLanguage, language);
        const account = await this.accountService.getByEmail(input.email);
        if (!account) {
            if ((await this.featureService.getFeatures()).allowRegister) {
                const token = await this.authAccountService.sendResetPasswordEmail({ email: input.email, language: emailLanguage });
                return token;
            }
            throw new NotFoundException();
        }
        const token = await this.authAccountService.sendResetPasswordEmail({ account, language: emailLanguage });
        return token;
    }

    @Mutation(() => String)
    @UseGuards(EnableEmailPasswordLoginGuard)
    async resetPasswordSendEmail(@Args('input') input: ResetPasswordSendEmailInput, @Req() req: Request): Promise<string> {
        const deviceInfo = this.deviceService.getDeviceInfo(req.headers['user-agent'] || '', req.headers['accept-language']);

        const language = input.language || deviceInfo.language;
        const emailLanguage = EnumConverter.toEnum(EmailLanguage, language);
        const account = await this.accountService.getByEmail(input.email);
        if (!account) {
            if ((await this.featureService.getFeatures()).allowRegister) {
                const token = await this.authAccountService.sendResetPasswordEmail({ email: input.email, language: emailLanguage });
                return token;
            }
            throw new NotFoundException();
        }
        const token = await this.authAccountService.sendResetPasswordEmail({ account, language: emailLanguage });
        return token;
    }
}
