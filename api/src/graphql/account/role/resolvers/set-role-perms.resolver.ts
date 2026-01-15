import { Args, Mutation, Resolver } from "@nestjs/graphql";
import { RoleService } from "@/account/role.service";
import { GqlAuthGuard } from "@/common/guards/gql-auth.guard";
import { UseGuards } from "@nestjs/common";
import { EditionSelfHostedGuard } from "@/common/guards/auth/edition_self_hosted.guard";
import { RoleSetPermInput } from "../types/role-set-perm-input.type";
import { CurrentTenent } from "@/common/decorators/current-tenant";
import { TenantContextGuard } from "@/common/guards/tenant-context.guard";

@Resolver()
@UseGuards(GqlAuthGuard)
@UseGuards(TenantContextGuard)
@UseGuards(EditionSelfHostedGuard)
export class SetRolePermsResolver {
  constructor(private readonly roleService: RoleService) { }

  @Mutation(() => Boolean)
  async setRolePerms(
    @Args('input') input: RoleSetPermInput,
    @CurrentTenent() tenant: any,
  ): Promise<boolean> {
    const dto = {
      key: input.key,
      menus: input.menus,
      tenantId: tenant.id,
    };
    await this.roleService.setRolePerms(dto);
    return true;
  }
}