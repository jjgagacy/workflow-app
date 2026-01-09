import { Args, Mutation, Resolver, Query } from "@nestjs/graphql";
import { AccountService } from "@/account/account.service";
import { LoginResponse, UserInfoResponse } from "../types/login-response.type";
import { EmailCodeLoginInput, EmailCodeLoginSendEmail, LoginInput, ResetPasswordSendEmailInput } from "../types/login-input.type";
import { AuthService } from "@/auth/auth.service";
import { CurrentUser } from "@/common/decorators/current-user";
import { BadRequestException, NotFoundException, Req, UseGuards } from "@nestjs/common";
import { GqlAuthGuard } from "@/common/guards/gql-auth.guard";
import { AuthAccountService } from "@/service/auth-account.service";
import { DeviceService } from "@/service/libs/device.service";
import { EnableEmailPasswordLoginGuard } from "@/common/guards/auth/enable-email-password-login.guard";
import { EmailInFreezeError } from "@/service/exceptions/account.error";
import { I18nService } from "nestjs-i18n";
import { I18nTranslations } from "@/generated/i18n.generated";
import { FeatureService } from "@/service/feature.service";
import { EnumConverter } from "@/common/utils/enums";
import { convertLanguageCode, EmailLanguage } from "@/mail/mail-i18n.service";
import { getMappedLang } from "@/i18n-global/langmap";
import { GqlRequest } from "@/common/decorators/gql-request";
import { EmailValidationPipe } from "@/common/pipes/email-validation.pipe";

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
  async emailCodeLogin(@Args('input') input: EmailCodeLoginInput, @GqlRequest() req: Request): Promise<LoginResponse> {
    const language = this.deviceService.getLanguageFromHeader(req.headers['accept-language']);
    const translatedLanguage = convertLanguageCode(getMappedLang(language));
    return this.authAccountService
      .validateEmailCodeLogin(input.email, input.token, input.code, translatedLanguage)
      .then(async (user) => {
        if (await this.authAccountService.isAccountFreezed(input.email)) {
          throw EmailInFreezeError.create(this.i18n);
        }
        return this.authService.login(user)
      });
  }

  @Mutation(() => String)
  async emailCodeLoginSendEmail(@Args('input') input: EmailCodeLoginSendEmail, @GqlRequest() req: Request): Promise<string> {
    const language = this.deviceService.getLanguageFromHeader(req.headers['accept-language']);
    const translatedLanguage = convertLanguageCode(getMappedLang(language));
    const account = await this.accountService.getByEmail(input.email);
    if (!account) {
      /*if ((await this.featureService.getFeatures()).allowRegister) {
        const token = await this.authAccountService.sendEmailCodeLogin(input.email, translatedLanguage);
        return token;
      }*/
      throw new NotFoundException();
    }
    const token = await this.authAccountService.sendEmailCodeLogin(input.email, translatedLanguage);
    return token;
  }

  @Mutation(() => String)
  @UseGuards(EnableEmailPasswordLoginGuard)
  async resetPasswordSendEmail(@Args('input') input: ResetPasswordSendEmailInput, @GqlRequest() req: Request): Promise<string> {
    const language = this.deviceService.getLanguageFromHeader(req.headers['accept-language']);
    const translatedLanguage = convertLanguageCode(getMappedLang(language));
    const account = await this.accountService.getByEmail(input.email);
    if (!account) {
      if ((await this.featureService.getFeatures()).allowRegister) {
        const token = await this.authAccountService.sendResetPasswordEmail({ email: input.email, language: translatedLanguage });
        return token;
      }
      throw new NotFoundException();
    }
    const token = await this.authAccountService.sendResetPasswordEmail({ account, language: translatedLanguage });
    return token;
  }

  @Mutation(() => Boolean)
  async checkLoginEmail(@Args('email', EmailValidationPipe) email: string): Promise<boolean> {
    const account = await this.accountService.getByEmail(email);
    if (!account) {
      throw new BadRequestException(this.i18n.t('account.EMAIL_NOT_EXIST', { args: { email } }));
    }
    const emailInFreeze = await this.authAccountService.isAccountFreezed(email);
    if (emailInFreeze) {
      throw EmailInFreezeError.create(this.i18n);
    }
    return true;
  }
}
