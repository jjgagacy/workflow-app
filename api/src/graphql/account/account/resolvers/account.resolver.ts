import { Args, Mutation, Query, Resolver } from "@nestjs/graphql";
import { AccountService } from "@/account/account.service";
import { GetAccountArgs } from "../types/get-account.args";
import { Account } from "../types/account.type";
import { formatDate } from "@/common/utils/time";
import { AccountEntity } from "@/account/entities/account.entity";
import { validNumber } from "@/common/utils/strings";
import { GqlAuthGuard } from "@/common/guards/gql-auth.guard";
import { BadRequestException, UseGuards } from "@nestjs/common";
import { EditionSelfHostedGuard } from "@/common/guards/auth/edition_self_hosted.guard";
import { AccountList } from "../types/account-list.type";
import { CurrentTenent } from "@/common/decorators/current-tenant";
import { CurrentUser } from "@/common/decorators/current-user";
import { TenantResponse } from "../types/login-response.type";
import { TenantService } from "@/service/tenant.service";
import { AuthAccountService } from "@/service/auth-account.service";
import { TenantNotFoundError } from "@/service/exceptions/tenant.error";
import { I18nService } from "nestjs-i18n";
import { I18nTranslations } from "@/generated/i18n.generated";
import { TenantContextGuard } from "@/common/guards/tenant-context.guard";

@Resolver()
@UseGuards(GqlAuthGuard)
export class AccountResolver {
  constructor(private readonly accountService: AccountService,
    private readonly authAccountService: AuthAccountService,
    private readonly tenantService: TenantService,
    private readonly i18n: I18nService<I18nTranslations>
  ) { }

  @Query(() => AccountList)
  @UseGuards(EditionSelfHostedGuard)
  @UseGuards(TenantContextGuard)
  async accounts(@Args() args: GetAccountArgs, @CurrentUser() user: any, @CurrentTenent() tenant: any): Promise<AccountList> {
    const { data: accountList, total } = await this.accountService.query({ ...args, relations: { roles: true }, tenantId: tenant.id });
    const data: Account[] = accountList.map(this.transformAccountToGQLType);
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

  private transformAccountToGQLType(account: AccountEntity): Account {
    const { roles } = account;
    return {
      id: account.id,
      username: account.username,
      email: account.email,
      mobile: account.mobile,
      status: account.status,
      realName: account.realName,
      created_at: formatDate(new Date(account.operate.createdAt)),
      created_by: account.operate.createdBy,
      roles: roles?.map((role) => role.name),
      roleKeys: roles?.map((role) => role.key),
    } as Account;
  }

  @Query(() => Account)
  async accountInfo(): Promise<Account> {
    throw new BadRequestException('Not implemented yet');
  }

  @Mutation(() => TenantResponse)
  async currentTenant(@CurrentUser() user: any): Promise<TenantResponse> {
    const account = await this.accountService.getById(user?.id);
    if (!account) {
      throw new BadRequestException();
    }
    const currentTenant = await this.authAccountService.getCurrentTenant(account.id);
    if (!currentTenant) {
      throw TenantNotFoundError.create(this.i18n);
    }
    const tenant = currentTenant.tenant;
    return {
      tenant_id: tenant.id,
      name: tenant.name,
      plan: tenant.plan
    } as TenantResponse;
  }

  @Mutation(() => TenantResponse)
  async switchTenant(@Args('tenant_id') tenantId: string, @CurrentUser() user: any): Promise<TenantResponse> {
    const account = await this.accountService.getById(user?.id);
    if (!account) {
      throw new BadRequestException();
    }
    const tenant = await this.tenantService.getTenant(tenantId);
    if (!tenant) {
      throw new BadRequestException();
    }
    await this.authAccountService.switchTenant(account, tenantId);
    return {
      tenant_id: tenant.id,
      name: tenant.name,
      plan: tenant.plan
    } as TenantResponse;
  }
}
