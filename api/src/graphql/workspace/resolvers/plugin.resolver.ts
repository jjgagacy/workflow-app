import { CurrentTenent } from "@/common/decorators/current-tenant";
import { AccountInitializedGuard } from "@/common/guards/auth/account-initialized.guard";
import { LoginRequiredGuard } from "@/common/guards/auth/login-required.guard";
import { TenantContextGuard } from "@/common/guards/tenant-context.guard";
import { PluginService } from "@/service/plugin/plugin.service";
import { BadRequestException, UseGuards } from "@nestjs/common";
import { Args, Mutation, Query, Resolver } from "@nestjs/graphql";
import { PluginInstallationResponse, PluginInstallResponse } from "../types/plugin.type";
import { PluginInstallation } from "@/ai/plugin/entities/plugin-installation";

@Resolver()
@UseGuards(LoginRequiredGuard)
export class PluginResolver {
  constructor(private readonly pluginService: PluginService) { }

  @Mutation(() => PluginInstallResponse)
  @UseGuards(AccountInitializedGuard)
  @UseGuards(TenantContextGuard)
  async installFromMarketplace(
    @Args('identifiers', { type: () => [String] }) identifiers: string[],
    @CurrentTenent() tenant: any
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

  @Query(() => [PluginInstallationResponse])
  @UseGuards(AccountInitializedGuard)
  @UseGuards(TenantContextGuard)
  async listPluginFromIds(
    @Args('pluginIds', { type: () => [String] }) pluginIds: string[],
    @CurrentTenent() tenant: any
  ): Promise<PluginInstallationResponse[]> {
    // Validate identifiers
    for (const pluginId of pluginIds) {
      if (typeof pluginId !== 'string' || !pluginId) {
        throw new BadRequestException('Invalid plugin id');
      }
    }
    // list plugins
    const plugins = await this.pluginService.listPluginsFromIds(tenant.id, pluginIds);
    return plugins.map(plugin => this.transformToPluginInstallation(plugin));
  }

  private transformToPluginInstallation(plugin: PluginInstallation): PluginInstallationResponse {
    return {
      id: plugin.id,
      pluginId: plugin.pluginId,
      name: plugin.declaration.name,
      createdAt: plugin.createdAt,
      updatedAt: plugin.updatedAt,
      meta: plugin.meta,
      tenantId: plugin.tenantId,
      version: plugin.version,
    };
  }
}