import { Args, Mutation, Resolver } from "@nestjs/graphql";
import { RoleService } from "@/account/role.service";
import { RoleResponse } from "../types/role-response.type";
import { CurrentUser } from "@/common/decorators/current-user";
import { GqlAuthGuard } from "@/common/guards/gql-auth.guard";
import { UseGuards } from "@nestjs/common";
import { EditionSelfHostedGuard } from "@/common/guards/auth/edition_self_hosted.guard";
import { RoleInput } from "../types/role.input.args";
import { CurrentTenent } from "@/common/decorators/current-tenant";
import { TenantContextGuard } from "@/common/guards/tenant-context.guard";

@Resolver()
@UseGuards(GqlAuthGuard)
@UseGuards(TenantContextGuard)
@UseGuards(EditionSelfHostedGuard)
export class UpdateRoleResolver {
  constructor(private readonly roleService: RoleService) { }

  @Mutation(() => RoleResponse)
  async updateRole(@Args('input') input: RoleInput, @CurrentUser() user: any, @CurrentTenent() tenant: any): Promise<RoleResponse> {
    const dto = {
      id: input.id,
      key: input.key,
      name: input.name,
      parent: input.parent,
      status: input.status,
      updatedBy: user.name,
      tenantId: tenant.id,
    };
    const createRes = await this.roleService.update(dto);
    const id = createRes?.id || 0;
    return { id };
  }
}