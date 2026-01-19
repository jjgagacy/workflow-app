import { Args, Mutation, Resolver } from "@nestjs/graphql";
import { RoleService } from "@/account/role.service";
import { RoleResponse } from "../types/role-response.type";
import { CurrentUser } from "@/common/decorators/current-user";
import { UseGuards } from "@nestjs/common";
import { RoleInput } from "../types/role.input.args";
import { CurrentTenent } from "@/common/decorators/current-tenant";
import { TenantContextGuard } from "@/common/guards/tenant-context.guard";

@Resolver()
@UseGuards(TenantContextGuard)
export class CreateRoleResolver {
  constructor(private readonly roleService: RoleService) { }

  @Mutation(() => RoleResponse)
  async createRole(
    @Args('input') input: RoleInput,
    @CurrentUser() user: any,
    @CurrentTenent() tenant: any,
  ): Promise<RoleResponse> {
    const dto = {
      key: input.key || '',
      name: input.name || '',
      parent: input.parent || '',
      status: input.status || 0,
      createdBy: user.name as string,
      tenantId: tenant.id,
    };
    const createRes = await this.roleService.create(dto);
    const id = createRes.id;
    return { id };
  }
}