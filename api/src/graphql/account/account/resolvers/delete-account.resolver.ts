import { Args, Int, Mutation, Resolver } from "@nestjs/graphql";
import { AccountService } from "@/account/account.service";
import { GqlAuthGuard } from "@/common/guards/gql-auth.guard";
import { UseGuards } from "@nestjs/common";
import { EditionSelfHostedGuard } from "@/common/guards/auth/edition_self_hosted.guard";
import { TenantContextGuard } from "@/common/guards/tenant-context.guard";

@Resolver()
@UseGuards(GqlAuthGuard)
@UseGuards(TenantContextGuard)
@UseGuards(EditionSelfHostedGuard)
export class DeleteAccountResolver {
  constructor(private readonly accountService: AccountService) { }

  @Mutation(() => Boolean)
  async deleteAccount(@Args({ name: 'id', type: () => Int }) id: number): Promise<boolean> {
    await this.accountService.delete(id);
    return true;
  }
}