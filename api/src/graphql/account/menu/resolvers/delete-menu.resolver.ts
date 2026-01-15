import { Args, Int, Mutation, Resolver } from "@nestjs/graphql";
import { MenuService } from "@/account/menu.service";
import { GqlAuthGuard } from "@/common/guards/gql-auth.guard";
import { UseGuards } from "@nestjs/common";
import { EditionSelfHostedGuard } from "@/common/guards/auth/edition_self_hosted.guard";
import { CurrentTenent } from "@/common/decorators/current-tenant";
import { TenantContextGuard } from "@/common/guards/tenant-context.guard";

@Resolver()
@UseGuards(GqlAuthGuard)
@UseGuards(TenantContextGuard)
@UseGuards(EditionSelfHostedGuard)
export class DeleteMenuResolver {
  constructor(private readonly menuService: MenuService) { }

  @Mutation(() => Boolean)
  async deleteMenu(@Args({ name: 'id', type: () => Int }) id: number, @CurrentTenent() tenant: any): Promise<boolean> {
    await this.menuService.deleteById(id, tenant.id);
    return true;
  }
}