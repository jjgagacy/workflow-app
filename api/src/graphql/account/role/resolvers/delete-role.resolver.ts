import { Args, Int, Mutation, Resolver } from "@nestjs/graphql";
import { RoleService } from "@/account/role.service";
import { GqlAuthGuard } from "@/common/guards/gql-auth.guard";
import { UseGuards } from "@nestjs/common";
import { EditionSelfHostedGuard } from "@/common/guards/auth/edition_self_hosted.guard";
import { CurrentTenent } from "@/common/decorators/current-tenant";

@Resolver()
@UseGuards(GqlAuthGuard)
@UseGuards(EditionSelfHostedGuard)
export class DeleteRoleResolver {
  constructor(private readonly roleService: RoleService) { }

  @Mutation(() => Boolean)
  async deleteRole(
    @Args({ name: 'id', type: () => Int }) id: number,
    @CurrentTenent() tenant: any,
  ): Promise<boolean> {
    await this.roleService.deleteById(id, tenant.id);
    return true;
  }
}