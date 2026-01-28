import { Args, Int, Mutation, Resolver } from "@nestjs/graphql";
import { AccountService } from "@/account/account.service";
import { CurrentUser } from "@/common/decorators/current-user";
import { UpdateAccountDto } from "@/account/account/dto/update-account.dto";
import * as bcrypt from 'bcrypt';
import { BadRequestException, InternalServerErrorException, NotFoundException, UseGuards } from "@nestjs/common";
import { I18nTranslations } from "@/generated/i18n.generated";
import { I18nService } from "nestjs-i18n";
import authConfig from "@/config/auth.config";
import { EditionSelfHostedGuard } from "@/common/guards/auth/edition_self_hosted.guard";
import { AccountResponse } from "../types/account-response.type";
import { AccountInput, UpdateAccountAvatarInput, UpdateAccountLanguageInput, UpdateAccountNameInput, UpdateAccountThemeInput } from "../types/account-input.type";
import { AccountNotFoundError } from "@/service/exceptions/account.error";
import { ChangeEmailSendInput, ConfirmEmailNewInput, UpdateAccountNewEmailInput, ValidateChangeEmailOldInput } from "../types/login-input.type";
import { GqlRequest } from "@/common/decorators/gql-request";
import { DeviceService } from "@/service/libs/device.service";
import { convertLanguageCode } from "@/mail/mail-i18n.service";
import { getMappedLang } from "@/i18n-global/langmap";
import { AuthAccountService } from "@/service/auth-account.service";
import { TOKEN_TYPES, TokenManagerService } from "@/service/libs/token-manager.service";
import { CurrentTenent } from "@/common/decorators/current-tenant";
import { TenantAccountService, TenantService } from "@/service/tenant.service";

@Resolver()
@UseGuards(EditionSelfHostedGuard)
export class UpdateAccountResolver {
  constructor(
    private readonly accountService: AccountService,
    private readonly tenantService: TenantService,
    private readonly tenantAccountService: TenantAccountService,
    private readonly i18n: I18nService<I18nTranslations>
  ) { }

  @Mutation(() => AccountResponse)
  async updateAccount(@Args('input') input: AccountInput, @CurrentUser() user: any): Promise<AccountResponse> {
    const dto: UpdateAccountDto = {
      id: input.id,
      realName: input.realName,
      updatedBy: user.name,
      roles: input.roles
    };
    const updateRes = await this.accountService.update(dto);
    const id = updateRes?.id || 0;
    return { id };
  }

  @Mutation(() => Boolean)
  async updateAccountPassword(@CurrentUser() user: any,
    @Args('password', { nullable: false }) password: string,
    @Args('newPassword', { nullable: false }) newPassword: string) {
    // 1. 验证输入参数
    if (!password?.trim()) throw new BadRequestException(this.i18n.t('account.PASSWORD_NOT_EMPTY'));
    if (!newPassword?.trim()) throw new BadRequestException(this.i18n.t('account.PASSWORD_NEW_NOT_EMPTY'));
    if (newPassword.length < 8) throw new BadRequestException(this.i18n.t('account.PASSWORD_FORMAT_INVALID'));
    // 2. 获取用户账户信息
    const account = await this.accountService.getById(user.id);
    if (!account) throw new BadRequestException(this.i18n.t('account.ACCOUNT_NOT_EXIST', { args: { name: user.id } }));
    // 3. 验证当前密码
    const isPasswordValid = await bcrypt.compare(password, account.password);
    if (!isPasswordValid) {
      throw new BadRequestException(this.i18n.t('account.PASSWORD_INVALID'));
    }
    // 4. 密码强度验证
    if (!this.isPasswordStrong(newPassword)) {
      throw new BadRequestException(this.i18n.t('account.PASSWORD_FORMAT_INVALID'));
    }
    const dto: UpdateAccountDto = {
      id: user.id,
      password: newPassword,
      updatedBy: user.name
    }
    const updateRes = await this.accountService.update(dto);
    if (!updateRes) throw new InternalServerErrorException(this.i18n.t('system.UPDATE_FAILED'));
    return true;
  }

  // 密码强度检查方法
  private isPasswordStrong(password: string): boolean {
    const passwordPattern = authConfig().passwordPattern;
    return passwordPattern.test(password);
  }

  @Mutation(() => Boolean)
  async toggleAccountStatus(
    @CurrentUser() user: any,
    @CurrentTenent() tenant: any,
    @Args({ name: 'id', type: () => Int }) id: number
  ): Promise<boolean> {
    const tenantEntity = await this.tenantService.getTenant(tenant.id);
    if (!tenantEntity) {
      throw new NotFoundException();
    }
    const accountEntity = await this.accountService.getById(user.id);
    if (!accountEntity) {
      throw new NotFoundException();
    }
    const tenantAccountEntity = await this.tenantAccountService.getTenanatMember(tenant, accountEntity);
    if (!tenantAccountEntity) {
      throw new NotFoundException();
    }
    const dto: UpdateAccountDto = {
      id: id,
      updatedBy: user.name
    }
    await this.accountService.toggleStatus(dto);
    return true;
  }

  @Mutation(() => Boolean)
  async removeAccount(
    @CurrentUser() user: any,
    @CurrentTenent() tenant: any,
    @Args({ name: 'id', type: () => Int }) id: number,
  ): Promise<boolean> {
    const tenantEntity = await this.tenantService.getTenant(tenant.id);
    if (!tenantEntity) {
      throw new NotFoundException();
    }
    const accountEntity = await this.accountService.getById(user.id);
    if (!accountEntity) {
      throw new NotFoundException();
    }
    const tenantAccountEntity = await this.tenantAccountService.getTenanatMember(tenant, accountEntity);
    if (!tenantAccountEntity) {
      throw new NotFoundException();
    }

    await this.tenantAccountService.removeTenantMember(tenantEntity, accountEntity);
    return true;
  }
}

@Resolver()
@UseGuards(EditionSelfHostedGuard)
export class UpdateAccountFieldsResolver {
  constructor(
    private readonly accountService: AccountService,
    private readonly i18n: I18nService<I18nTranslations>
  ) { }

  @Mutation(() => Boolean)
  async updateAccountName(
    @Args('input') input: UpdateAccountNameInput,
    @CurrentUser() user: any
  ): Promise<boolean> {
    const account = await this.accountService.getById(user.id);
    if (!account) {
      throw AccountNotFoundError.create(this.i18n);
    }

    const dto: UpdateAccountDto = {
      id: user.id,
      username: input.username,
      updatedBy: user.name,
    };

    await this.accountService.update(dto);
    return true;
  }

  @Mutation(() => Boolean)
  async updateAccountAvatar(
    @Args('input') input: UpdateAccountAvatarInput,
    @CurrentUser() user: any
  ): Promise<boolean> {
    const account = await this.accountService.getById(user.id);
    if (!account) {
      throw AccountNotFoundError.create(this.i18n);
    }
    const dto: UpdateAccountDto = {
      id: user.id,
      avatar: input.avatar,
      updatedBy: user.name,
    };
    await this.accountService.update(dto);
    return true;
  }

  @Mutation(() => Boolean)
  async updateAccountLanguage(
    @Args('input') input: UpdateAccountLanguageInput,
    @CurrentUser() user: any
  ): Promise<boolean> {
    const account = await this.accountService.getById(user.id);
    if (!account) {
      throw AccountNotFoundError.create(this.i18n);
    }

    const dto: UpdateAccountDto = {
      language: input.language,
      updatedBy: user.name,
    };

    await this.accountService.update(dto);
    return true;
  }

  @Mutation(() => Boolean)
  async updateAccountTheme(
    @Args('input') input: UpdateAccountThemeInput,
    @CurrentUser() user: any
  ): Promise<boolean> {
    const account = await this.accountService.getById(user.id);
    if (!account) {
      throw AccountNotFoundError.create(this.i18n);
    }

    const dto: UpdateAccountDto = {
      theme: input.theme,
      updatedBy: user.name,
    };

    await this.accountService.update(dto);
    return true;
  }

}

@Resolver()
@UseGuards(EditionSelfHostedGuard)
export class ChangeEmailResolver {
  constructor(
    private readonly accountService: AccountService,
    private readonly i18n: I18nService<I18nTranslations>,
    private readonly deviceService: DeviceService,
    private readonly authAccountService: AuthAccountService,
    private readonly tokenManagerService: TokenManagerService
  ) { }

  @Mutation(() => String)
  async changeEmailOldSend(
    @Args('input') input: ChangeEmailSendInput,
    @GqlRequest() req: Request,
    @CurrentUser() user: any
  ): Promise<string> {
    const language = this.deviceService.getLanguageFromHeader(input.language || req.headers['accept-language']);
    const translatedLanguage = convertLanguageCode(getMappedLang(language));
    const account = await this.accountService.getById(user.id);
    if (!account) {
      throw new NotFoundException();
    }
    const token = await this.authAccountService.sendChangeEmailVerification(account, translatedLanguage);
    return token;
  }

  @Mutation(() => String)
  async validateChangeEmailOld(
    @Args('input') input: ValidateChangeEmailOldInput,
    @CurrentUser() user: any
  ): Promise<string> {
    const account = await this.accountService.getById(user.id);
    if (!account) {
      throw new NotFoundException();
    }
    await this.authAccountService.validateChangeEmailCode(account.email, input.token, input.code);

    // Verified, revoke the token
    await this.tokenManagerService.removeToken(input.token, TOKEN_TYPES.CHANGE_EMAIL);
    // Refresh token
    const newToken = await this.tokenManagerService.generateToken(TOKEN_TYPES.CHANGE_EMAIL, undefined, account.email, { code: input.code });
    return newToken;
  }

  @Mutation(() => String)
  async confirmEmailNewSend(
    @Args('input') input: ConfirmEmailNewInput,
    @GqlRequest() req: Request,
    @CurrentUser() user: any
  ): Promise<string> {
    const language = this.deviceService.getLanguageFromHeader(req.headers['accept-language']);
    const translatedLanguage = convertLanguageCode(getMappedLang(language));
    const account = await this.accountService.getById(user.id);
    if (!account) {
      throw new NotFoundException();
    }
    await this.authAccountService.validateChangeEmailCode(account.email, input.token, input.code);
    // send new code to new email
    const token = await this.authAccountService.sendConfirmEmailVerification(account, input.newEmail, translatedLanguage);
    return token;
  }

  @Mutation(() => Boolean)
  async updateAccountNewEmail(
    @Args('input') input: UpdateAccountNewEmailInput,
    @CurrentUser() user: any
  ): Promise<boolean> {
    await this.authAccountService.validateAccountNewEmailCode(input.newEmail, input.token, input.code);

    const dto: UpdateAccountDto = {
      id: user.id,
      email: input.newEmail,
      updatedBy: user.name,
    };

    await this.accountService.update(dto);
    return true;
  }
}
