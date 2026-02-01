import { Args, Mutation, Query, Resolver } from "@nestjs/graphql";
import { AccountService } from "@/account/account.service";
import { GetAccountArgs } from "../types/get-account.args";
import { Account } from "../types/account.type";
import { formatDate } from "@/common/utils/time";
import { AccountEntity } from "@/account/entities/account.entity";
import { validNumber } from "@/common/utils/strings";
import { BadRequestException, NotFoundException, UseGuards } from "@nestjs/common";
import { EditionSelfHostedGuard } from "@/common/guards/auth/edition_self_hosted.guard";
import { AccountList } from "../types/account-list.type";
import { CurrentTenent } from "@/common/decorators/current-tenant";
import { CurrentUser } from "@/common/decorators/current-user";
import { TenantService } from "@/service/tenant.service";
import { AuthAccountService } from "@/service/auth-account.service";
import { I18nService } from "nestjs-i18n";
import { I18nTranslations } from "@/generated/i18n.generated";
import { TenantContextGuard } from "@/common/guards/tenant-context.guard";
import { FileService } from "@/service/file.service";
import { AccountInput, DeleteAccountEmailSendInput, DeleteAccountInput, ValidateDeleteAccountCodeInput } from "../types/account-input.type";
import { AccountResponse } from "../types/account-response.type";
import { GqlRequest } from "@/common/decorators/gql-request";
import { DeviceService } from "@/service/libs/device.service";
import { getMappedLang } from "@/i18n-global/langmap";
import { convertLanguageCode } from "@/mail/mail-i18n.service";
import { TOKEN_TYPES, TokenManagerService } from "@/service/libs/token-manager.service";
import { maskMobileSafely, maskUsernameSafely } from "@/monie/helpers/account-fields.helper";

@Resolver()
export class AccountResolver {
  constructor(private readonly accountService: AccountService,
    private readonly authAccountService: AuthAccountService,
    private readonly tenantService: TenantService,
    private readonly i18n: I18nService<I18nTranslations>,
    private readonly fileService: FileService
  ) { }

  @Query(() => AccountList)
  @UseGuards(EditionSelfHostedGuard)
  @UseGuards(TenantContextGuard)
  async accounts(
    @Args() args: GetAccountArgs,
    @CurrentUser() user: any,
    @CurrentTenent() tenant: any
  ): Promise<AccountList> {
    const { data: accountList, total } = await this.accountService.query({ ...args, relations: { roles: true }, tenantId: tenant.id });
    const tenantEntity = await this.tenantService.getTenant(tenant.id);
    const owner = tenantEntity ? await this.tenantService.getOwner(tenantEntity) : null;
    const data: Account[] = accountList.map((account) =>
      this.transformAccountToGQLType(account, {
        maskUsername: (account: AccountEntity) =>
          shouldMaskAccountfields(account, user.id) ? maskUsernameSafely(account.username) : account.username,
        maskMobile: (account: AccountEntity) =>
          shouldMaskAccountfields(account, user.id) ? maskMobileSafely(account.mobile) : account.mobile,
        isOwner: (account: AccountEntity) => account.id === owner?.id,
      })
    );
    return {
      data,
      ...(validNumber(args.page) && validNumber(args.limit) && {
        pageInfo: {
          page: args.page ?? 0,
          pageSize: args.limit ?? 0,
          total: total ?? 0
        }
      })
    };
  }

  private transformAccountToGQLType(account: AccountEntity, options: {
    maskUsername?: (account: AccountEntity) => string;
    maskMobile?: (account: AccountEntity) => string;
    isOwner?: (account: AccountEntity) => boolean,
  } = {}): Account {
    const { roles } = account;
    return {
      id: account.id,
      username: options?.maskUsername?.(account) ?? maskUsernameSafely(account.username),
      email: account.email,
      mobile: options?.maskMobile?.(account) ?? maskMobileSafely(account.mobile),
      status: account.status,
      realName: account.realName,
      theme: account.theme,
      language: account.prefer_language,
      appearance: account.appearance,
      timezone: account.timezone,
      created_at: formatDate(new Date(account.operate.createdAt)),
      created_by: account.operate.createdBy,
      roles: roles?.map((role) => role.name),
      roleKeys: roles?.map((role) => role.key),
      isOwner: options?.isOwner?.(account),
    } as Account;
  }

  @Query(() => Account)
  async accountInfo(
    @CurrentUser() user: any,
    @CurrentTenent() tenant: any
  ): Promise<Account> {
    const tenantEntity = await this.tenantService.getTenant(tenant?.id);
    const owner = tenantEntity ? await this.tenantService.getOwner(tenantEntity) : null;
    const accountEntity = await this.accountService.getById(user?.id);
    if (!accountEntity) {
      throw new BadRequestException();
    }
    const account = this.transformAccountToGQLType(accountEntity, {
      maskUsername: (account: AccountEntity) =>
        shouldMaskAccountfields(account, user.id) ? maskUsernameSafely(account.username) : account.username,
      maskMobile: (account: AccountEntity) =>
        shouldMaskAccountfields(account, user.id) ? maskMobileSafely(account.mobile) : account.mobile,
      isOwner: (account: AccountEntity) => account.id === owner?.id,
    });
    if (accountEntity.avatar !== '') {
      const uploadFileEntity = await this.fileService.getUploadFileEntity(accountEntity.avatar);
      if (uploadFileEntity) {
        account.avatar = uploadFileEntity.sourceUrl;
      }
    }
    return account;
  }

}
@Resolver()
@UseGuards(EditionSelfHostedGuard)
export class CreateAccountResolver {
  constructor(
    private readonly accountService: AccountService,
    private readonly authAccountService: AuthAccountService,
    private readonly tenantService: TenantService,
    private readonly deviceService: DeviceService,
  ) { }

  @Mutation(() => AccountResponse)
  async createAccount(
    @Args('input') input: AccountInput,
    @CurrentUser() user: any,
    @CurrentTenent() tenant: any,
    @GqlRequest() req: Request,
  ): Promise<AccountResponse> {
    const language = this.deviceService.getLanguageFromHeader(req.headers['accept-language']);
    const translatedLanguage = convertLanguageCode(getMappedLang(language));
    const dto = {
      username: input.username || '',
      realName: input.realName || '',
      password: input.password || '',
      email: input.email,
      mobile: input.mobile,
      createdBy: user.name,
      roles: input.roles
    };
    const tenantEntity = await this.tenantService.getTenant(tenant.id);
    if (!tenantEntity) {
      throw new NotFoundException();
    }
    const accountEntity = await this.accountService.getById(user.id);
    const inviterName = accountEntity?.realName || accountEntity?.username || user.name;

    const createdAccount = await this.authAccountService.createAccountForTenant(
      dto,
      tenantEntity,
      { checkEmailExistence: true, inviterName },
      translatedLanguage,
    );
    const id = createdAccount.id;
    return { id };
  }
}

@Resolver()
export class DeleteAccountResolver {
  constructor(
    private readonly accountService: AccountService,
    private readonly deviceService: DeviceService,
    private readonly authAccountService: AuthAccountService,
    private readonly tokenManagerService: TokenManagerService,
  ) { }

  @Mutation(() => Boolean)
  async deleteAccount(
    @Args('input') input: DeleteAccountInput,
    @CurrentUser() user: any
  ): Promise<boolean> {
    const account = await this.accountService.getById(user.id);
    if (!account) {
      throw new NotFoundException();
    }
    await this.authAccountService.validateAccountDeleteEmailCode(account, input.token, input.code);
    // revoke token
    await this.tokenManagerService.removeToken(input.token, TOKEN_TYPES.ACCOUNT_DELETION);
    await this.accountService.deleteAccount(account);
    return true;
  }

  @Mutation(() => String)
  async deleteAccountEmailSend(
    @Args('input') input: DeleteAccountEmailSendInput,
    @GqlRequest() req: Request,
    @CurrentUser() user: any
  ): Promise<string> {
    const language = this.deviceService.getLanguageFromHeader(input.language || req.headers['accept-language']);
    const translatedLanguage = convertLanguageCode(getMappedLang(language));
    const account = await this.accountService.getById(user.id);
    if (!account) {
      throw new NotFoundException();
    }
    const token = await this.authAccountService.sendAccountDeletionEmail(account, translatedLanguage);
    return token;
  }

  @Mutation(() => String)
  async validateDeleteAccountEmailCode(
    @Args('input') input: ValidateDeleteAccountCodeInput,
    @CurrentUser() user: any
  ): Promise<string> {
    const account = await this.accountService.getById(user.id);
    if (!account) {
      throw new NotFoundException();
    }
    await this.authAccountService.validateAccountDeleteEmailCode(account, input.token, input.code);

    // revoke token
    await this.tokenManagerService.removeToken(input.token, TOKEN_TYPES.ACCOUNT_DELETION);
    // refresh token
    const newToken = await this.tokenManagerService.generateToken(TOKEN_TYPES.ACCOUNT_DELETION, undefined, account.email, { code: input.code });
    return newToken;
  }

}

const shouldMaskAccountfields = (account: AccountEntity, user_id: any) => account.id !== user_id;
