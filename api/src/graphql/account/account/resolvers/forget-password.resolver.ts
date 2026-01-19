import { AuthAccountService } from "@/service/auth-account.service";
import { Args, Mutation, Resolver } from "@nestjs/graphql";
import { ForgetPasswordCheckResponse, ForgetPasswordInput, ForgetPasswordResetInput } from "../types/forget-password.type";
import { Req, UseGuards } from "@nestjs/common";
import { Request } from "express";
import { DeviceService } from "@/service/libs/device.service";
import { EnumConverter } from "@/common/utils/enums";
import { EmailLanguage } from "@/mail/mail-i18n.service";
import { AccountService } from "@/account/account.service";
import { I18nService } from "nestjs-i18n";
import { I18nTranslations } from "@/generated/i18n.generated";
import { AccountNotFoundError, ForgetPasswordErrorRateLimit, PasswordMismatchError } from "@/service/exceptions/account.error";
import { EnableEmailPasswordLoginGuard } from "@/common/guards/auth/enable-email-password-login.guard";
import { EmailRateLimiterService } from "@/service/libs/rate-limiter/email-rate-limiter.service";
import { TOKEN_TYPES, TokenManagerService } from "@/service/libs/token-manager.service";
import { InvalidEmailError, InvalidTokenError, VerifyCodeError } from "@/service/exceptions/token.error";
import { UpdateAccountDto } from "@/account/account/dto/update-account.dto";
import { Public } from "@/common/guards/universal-auth.guard";

@Resolver()
export class ForgetPasswordResolver {
  constructor(
    private readonly deviceService: DeviceService,
    private readonly authAccountService: AuthAccountService,
    private readonly accountService: AccountService,
    private readonly rateLimiterService: EmailRateLimiterService,
    private readonly tokenManagerService: TokenManagerService,
    private readonly i18n: I18nService<I18nTranslations>,
  ) { }

  @Public()
  @Mutation(() => String)
  @UseGuards(EnableEmailPasswordLoginGuard)
  async forgetPasswordSendEmail(@Args('input') input: ForgetPasswordInput, @Req() req: Request): Promise<string> {
    const deviceInfo = this.deviceService.getDeviceInfo(req.headers['user-agent'] || '', req.headers['accept-language']);

    const language = input.language || deviceInfo.language;
    const emailLanguage = EnumConverter.toEnum(EmailLanguage, language);
    const account = await this.accountService.getByEmail(input.email);
    if (!account) {
      throw AccountNotFoundError.create(this.i18n);
    }

    const token = await this.authAccountService.sendResetPasswordEmail({ account, email: emailLanguage });
    return token;
  }

  @Public()
  @Mutation(() => ForgetPasswordCheckResponse)
  @UseGuards(EnableEmailPasswordLoginGuard)
  async forgetPasswordTokenCheck(@Args('input') input: ForgetPasswordInput): Promise<ForgetPasswordCheckResponse> {
    const isForgetPasswordErrorRateLimit = await this.authAccountService.isForgetPasswordErrorRateLimit(input.email);
    if (isForgetPasswordErrorRateLimit) {
      throw ForgetPasswordErrorRateLimit.create(this.i18n);
    }

    const tokenData = await this.tokenManagerService.getTokenData(input.token, TOKEN_TYPES.RESET_PASSWORD);
    if (!tokenData) {
      throw InvalidTokenError.create(this.i18n);
    }
    if (input.code != tokenData.code) {
      throw VerifyCodeError.create(this.i18n);
    }
    if (input.email != tokenData.email) {
      throw InvalidEmailError.create(this.i18n);
    }

    // Verified, revoke the first token
    await this.tokenManagerService.removeToken(input.token, TOKEN_TYPES.RESET_PASSWORD);
    // Refesh token data by generating a new token
    const newToken = await this.tokenManagerService.generateToken(TOKEN_TYPES.RESET_PASSWORD, undefined, input.email, { code: input.code });

    await this.authAccountService.resetForgetPasswordErrorRateLimit(input.email);
    return { isValid: true, email: input.email, token: newToken };
  }

  @Public()
  @Mutation(() => Boolean)
  @UseGuards(EnableEmailPasswordLoginGuard)
  async forgetPasswordReset(@Args('input') input: ForgetPasswordResetInput): Promise<boolean> {
    if (input.confirmPassword != input.newPassword) {
      throw PasswordMismatchError.create(this.i18n);
    }

    const tokenData = await this.tokenManagerService.getTokenData(input.token, TOKEN_TYPES.RESET_PASSWORD);
    if (!tokenData) {
      throw InvalidTokenError.create(this.i18n);
    }

    // Verified, revoke the first token
    await this.tokenManagerService.removeToken(input.token, TOKEN_TYPES.RESET_PASSWORD);
    const account = await this.accountService.getByEmail(tokenData.email)
    if (!account) {
      throw AccountNotFoundError.create(this.i18n);
    }
    const dto: UpdateAccountDto = {
      id: account.id,
      // email: tokenData.email,
      password: input.newPassword,
      updatedBy: 'forgetPassword',
    };

    await this.accountService.update(dto);
    return true;
  }
}
