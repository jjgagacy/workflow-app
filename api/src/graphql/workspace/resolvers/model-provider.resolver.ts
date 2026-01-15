import { AccountInitializedGuard } from "@/common/guards/auth/account-initialized.guard";
import { EditionSelfHostedGuard } from "@/common/guards/auth/edition_self_hosted.guard";
import { GqlAuthGuard } from "@/common/guards/gql-auth.guard";
import { TenantContextGuard } from "@/common/guards/tenant-context.guard";
import { UseGuards } from "@nestjs/common";
import { Query, Resolver } from "@nestjs/graphql";

@Resolver()
@UseGuards(GqlAuthGuard)
@UseGuards(TenantContextGuard)
@UseGuards(EditionSelfHostedGuard)
export class ModelProviderResolver {
  constructor() { }

  // @UseGuards(AccountInitializedGuard)
  // @Query(() => [ProviderList])
  // async providers(): Promise<ProviderList[]> {

  // }
}
