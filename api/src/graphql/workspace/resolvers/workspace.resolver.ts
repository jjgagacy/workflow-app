import { AccountService } from "@/account/account.service";
import { CurrentTenent } from "@/common/decorators/current-tenant";
import { CurrentUser } from "@/common/decorators/current-user";
import { AccountNotInFreezeGuard } from "@/common/guards/auth/account-not-infreeze.guard";
import { GqlAuthGuard } from "@/common/guards/gql-auth.guard";
import { TenantContextGuard } from "@/common/guards/tenant-context.guard";
import { I18nTranslations } from "@/generated/i18n.generated";
import { WorkspaceDetail, WorkspaceList } from "@/graphql/workspace/types/workspace.type";
import { AuthAccountService } from "@/service/auth-account.service";
import { AccountNotFoundError } from "@/service/exceptions/account.error";
import { TenantNotFoundError } from "@/service/exceptions/tenant.error";
import { TenantService } from "@/service/tenant.service";
import { BadRequestException, Req, UseGuards } from "@nestjs/common";
import { Args, Mutation, Query, Resolver } from "@nestjs/graphql";
import { I18nService } from "nestjs-i18n";

@Resolver()
@UseGuards(GqlAuthGuard)
export class WorkspaceResolver {
  constructor(
    private readonly authAccountService: AuthAccountService,
    private readonly tenantService: TenantService,
    private readonly accountService: AccountService,
    private readonly i18n: I18nService<I18nTranslations>,
  ) { }

  @Query(() => [WorkspaceList])
  @UseGuards(AccountNotInFreezeGuard)
  async workspaces(@CurrentUser() user: any): Promise<WorkspaceList[]> {
    const workspaces: WorkspaceList[] = [];
    const tenants = await this.authAccountService.getAvailableTenants(user.id);
    const currentTenant = (await this.authAccountService.getCurrentTenant(user.id))?.tenant;
    tenants.forEach((tenant) => {
      workspaces.push({
        id: tenant.id,
        name: tenant.name,
        status: tenant.status,
        plan: tenant.plan,
        created_at: tenant.operate.createdAt,
        current: currentTenant?.id == tenant.id,
      });
    });
    return workspaces;
  }

  @Query(() => WorkspaceDetail)
  @UseGuards(TenantContextGuard)
  async workspaceDetail(
    @CurrentUser() user: any,
    @CurrentTenent() currentTenant: any
  ): Promise<WorkspaceDetail> {
    const account = await this.accountService.getById(user.id);
    if (!account) {
      throw AccountNotFoundError.create(this.i18n);
    }
    const tenant = await this.tenantService.getTenant(currentTenant.id);
    if (!tenant) {
      throw TenantNotFoundError.create(this.i18n);
    }
    const workspaceDetail: WorkspaceDetail = {
      id: tenant.id,
      name: tenant.name,
      status: tenant.status,
      plan: tenant.plan,
      created_at: tenant.operate.createdAt,
    };

    return workspaceDetail;
  }

  @Mutation(() => Boolean)
  async switchWorkspace(
    @Args({ name: 'tenant_id', type: () => String }) tenantId: string,
    @CurrentUser() user: any,
  ): Promise<boolean> {
    const account = await this.accountService.getById(user.id);
    if (!account) {
      throw AccountNotFoundError.create(this.i18n);
    }
    await this.authAccountService.switchTenant(account, tenantId);
    return true;
  }
}

