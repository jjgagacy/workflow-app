import { AccountService } from '@/account/account.service';
import { I18nTranslations } from '@/generated/i18n.generated';
import { AuthAccountService } from '@/service/auth-account.service';
import { FeatureService } from '@/service/feature.service';
import { DeviceService } from '@/service/libs/device.service';
import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { I18nService } from 'nestjs-i18n';
import { EmailCodeLoginSendEmail, EmailCodeSignUpInput, InviteMemberActivationInput } from '../types/login-input.type';
import { BadRequestException } from '@nestjs/common';
import { getMappedLang } from '@/i18n-global/langmap';
import { convertLanguageCode } from '@/mail/mail-i18n.service';
import { GqlRequest } from '@/common/decorators/gql-request';
import { InviterResponse, LoginResponse } from '../types/login-response.type';
import { AccountAlreadyActivatedError, AccountNotFoundError, EmailExistingError, EmailInFreezeError } from '@/service/exceptions/account.error';
import { AuthService } from '@/auth/auth.service';
import { Public } from '@/common/guards/universal-auth.guard';
import { TenantAccountService } from '@/service/tenant.service';
import { AccountStatus } from '@/account/account.enums';
import { UpdateAccountDto } from '@/account/account/dto/update-account.dto';
import { TOKEN_TYPES, TokenManagerService } from '@/service/libs/token-manager.service';

@Resolver()
export class SignUpResolver {
  constructor(
    private readonly accountService: AccountService,
    private readonly authAccountService: AuthAccountService,
    private readonly tenantAccountService: TenantAccountService,
    private readonly deviceService: DeviceService,
    private readonly i18n: I18nService<I18nTranslations>,
    private readonly authService: AuthService,
    private readonly tokenManagerService: TokenManagerService,
    private readonly featureService: FeatureService,
  ) { }

  @Public()
  @Mutation(() => Boolean)
  async checkSignUpUsername(
    @Args('username') username: string,
  ): Promise<boolean> {
    const validateResult =
      await this.accountService.validateSignupUsername(username);
    if (!validateResult.valid) {
      throw new BadRequestException(validateResult.error);
    }
    return true;
  }

  @Public()
  @Mutation(() => String)
  async emailCodeSignupSendEmail(
    @Args('input') input: EmailCodeLoginSendEmail,
    @GqlRequest() req: Request,
  ): Promise<string> {
    const language = this.deviceService.getLanguageFromHeader(req.headers['accept-language']);
    const translatedLanguage = convertLanguageCode(getMappedLang(language));
    const emailInFreeze = await this.authAccountService.isAccountFreezed(input.email);
    if (emailInFreeze) {
      throw EmailInFreezeError.create(this.i18n);
    }
    const account = await this.accountService.getByEmail(input.email);
    if (account) {
      throw EmailExistingError.create(this.i18n);
    }
    const token = await this.authAccountService.sendEmailCodeLogin(input.email, translatedLanguage);
    return token;
  }

  @Public()
  @Mutation(() => LoginResponse)
  async emailCodeSignUp(@Args('input') input: EmailCodeSignUpInput, @GqlRequest() req: Request): Promise<LoginResponse> {
    const language = this.deviceService.getLanguageFromHeader(req.headers['accept-language']);
    const translatedLanguage = convertLanguageCode(getMappedLang(language));
    return this.authAccountService
      .validateEmailCodeLogin(input.email, input.token, input.code, translatedLanguage, input.username)
      .then(async (user) => {
        if (await this.authAccountService.isAccountFreezed(input.email)) {
          throw EmailInFreezeError.create(this.i18n);
        }
        return this.authService.login(user)
      });
  }

  @Public()
  @Mutation(() => InviterResponse)
  async inviteTokenCheck(@Args({ name: 'token', type: () => String }) token: string): Promise<InviterResponse> {
    if (token === '') {
      throw new BadRequestException();
    }
    const { account, tenant } = await this.authAccountService.validateInvitationToken(token);
    return {
      inviteeEmail: account.email,
      workspaceId: tenant.id,
      workspaceName: tenant.name,
      inviteeName: account.username,
    };
  }

  @Public()
  @Mutation(() => Boolean)
  async inviteMemberActivation(@Args('input') input: InviteMemberActivationInput): Promise<boolean> {
    const { account, tenant } = await this.authAccountService.validateInvitationToken(input.token);
    if (account.email != input.inviteeEmail) {
      throw AccountNotFoundError.create(this.i18n);
    }
    const tenantAccount = await this.tenantAccountService.getTenanatMember(tenant, account);
    if (!tenantAccount) {
      throw AccountNotFoundError.create(this.i18n);
    }
    if (account.status !== AccountStatus.PENDING) {
      throw AccountAlreadyActivatedError.create(this.i18n);
    }
    const dto: UpdateAccountDto = {
      id: account.id,
      username: input.inviteeName,
      status: AccountStatus.ACTIVE,
      updatedBy: 'Activated',
    };
    await this.accountService.update(dto);
    await this.tokenManagerService.removeToken(input.token, TOKEN_TYPES.INVITE_MEMBER);
    return true;
  }

}
