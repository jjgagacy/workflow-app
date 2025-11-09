import { AccountInitializedGuard } from "@/common/guards/auth/account-initialized.guard";
import { GqlAuthGuard } from "@/common/guards/gql-auth.guard";
import { UseGuards } from "@nestjs/common";
import { Query, Resolver } from "@nestjs/graphql";

@Resolver()
@UseGuards(GqlAuthGuard)
export class ModelProviderResolver {
    constructor() { }

    @UseGuards(AccountInitializedGuard)
    @Query(() => [ProviderList])
    async providers(): Promise<ProviderList[]> {

    }
}
