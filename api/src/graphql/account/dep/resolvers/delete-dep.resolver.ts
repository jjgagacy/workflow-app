import { Args, Int, Mutation, Resolver } from "@nestjs/graphql";
import { DepService } from "@/account/dep.service";
import { GqlAuthGuard } from "@/common/guards/gql-auth.guard";
import { UseGuards } from "@nestjs/common";
import { EditionSelfHostedGuard } from "@/common/guards/auth/edition_self_hosted.guard";
import { CurrentTenent } from "@/common/decorators/current-tenant";

@Resolver()
@UseGuards(GqlAuthGuard)
@UseGuards(EditionSelfHostedGuard)
export class DeleteDepResolver {
  constructor(private readonly depService: DepService) { }

  @Mutation(() => Boolean)
  async deleteDep(@Args({ name: 'id', type: () => Int }) id: number, @CurrentTenent() tenant: any): Promise<boolean> {
    await this.depService.deleteByIds([id], tenant.id);
    return true;
  }
}