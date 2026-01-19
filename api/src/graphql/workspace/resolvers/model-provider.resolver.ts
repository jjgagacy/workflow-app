import { EditionSelfHostedGuard } from "@/common/guards/auth/edition_self_hosted.guard";
import { UseGuards } from "@nestjs/common";
import { Resolver } from "@nestjs/graphql";

@Resolver()
@UseGuards(EditionSelfHostedGuard)
export class ModelProviderResolver {
  constructor() { }

  // @UseGuards(AccountInitializedGuard)
  // @Query(() => [ProviderList])
  // async providers(): Promise<ProviderList[]> {

  // }
}
