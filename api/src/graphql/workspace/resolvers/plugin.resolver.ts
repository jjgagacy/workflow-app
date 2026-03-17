import { CurrentTenent } from "@/common/decorators/current-tenant";
import { CurrentUser } from "@/common/decorators/current-user";
import { AccountInitializedGuard } from "@/common/guards/auth/account-initialized.guard";
import { LoginRequiredGuard } from "@/common/guards/auth/login-required.guard";
import { TenantContextGuard } from "@/common/guards/tenant-context.guard";
import { PluginService } from "@/service/plugin/plugin.service";
import { BadRequestException, UseGuards } from "@nestjs/common";
import { Args, Mutation, Resolver } from "@nestjs/graphql";
import { PluginInstallResponse } from "../types/plugin.type";

@Resolver()
@UseGuards(LoginRequiredGuard)
export class PluginResolver {
  constructor(private readonly pluginService: PluginService) { }

  @Mutation(() => PluginInstallResponse)
  @UseGuards(AccountInitializedGuard)
  @UseGuards(TenantContextGuard)
  async installFromMarketplace(
    @Args('identifiers') identifiers: string[],
    @CurrentTenent() tenant: any,
    @CurrentUser() user: any
  ): Promise<PluginInstallResponse> {
    // Validate identifiers
    for (const identifier of identifiers) {
      if (typeof identifier !== 'string' || !identifier) {
        throw new BadRequestException('Invalid plugin identifier');
      }
    }
    // Install plugins
    return this.pluginService.installFromMarketplace(tenant.id, identifiers);
  }
}