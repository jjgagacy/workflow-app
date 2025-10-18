import { Args, Int, Mutation, Resolver } from "@nestjs/graphql";
import { AccountService } from "@/account/account.service";
import { GqlAuthGuard } from "@/common/guards/gql-auth.guard";
import { UseGuards } from "@nestjs/common";

@Resolver()
@UseGuards(GqlAuthGuard)
export class DeleteAccountResolver {
    constructor(private readonly accountService: AccountService) { }

    @Mutation(() => Boolean)
    async deleteAccount(@Args({ name: 'id', type: () => Int }) id: number): Promise<boolean> {
        await this.accountService.delete(id);
        return true;
    }
}