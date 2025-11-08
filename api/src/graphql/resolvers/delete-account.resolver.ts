import { Args, Int, Mutation, Resolver } from "@nestjs/graphql";
import { AccountService } from "@/account/account.service";
import { GqlAuthGuard } from "@/common/guards/gql-auth.guard";
import { UseGuards } from "@nestjs/common";
import { EditionSelfHostedGuard } from "@/common/guards/auth/edition_self_hosted.guard";

@Resolver()
@UseGuards(GqlAuthGuard)
@UseGuards(EditionSelfHostedGuard)
export class DeleteAccountResolver {
    constructor(private readonly accountService: AccountService) { }

    @Mutation(() => Boolean)
    async deleteAccount(@Args({ name: 'id', type: () => Int }) id: number): Promise<boolean> {
        await this.accountService.delete(id);
        return true;
    }
}