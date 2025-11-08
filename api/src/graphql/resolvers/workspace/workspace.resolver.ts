import { CurrentUser } from "@/common/decorators/current-user";
import { AccountNotInFreezeGuard } from "@/common/guards/auth/account-not-infreeze.guard";
import { GqlAuthGuard } from "@/common/guards/gql-auth.guard";
import { WorkspaceList } from "@/graphql/types/workspace/workspace.type";
import { AuthAccountService } from "@/service/auth-account.service";
import { UseGuards } from "@nestjs/common";
import { Query, Resolver } from "@nestjs/graphql";

@Resolver()
@UseGuards(GqlAuthGuard)
export class WorkspaceResolver {
    constructor(
        private readonly authAccountService: AuthAccountService,
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
}

