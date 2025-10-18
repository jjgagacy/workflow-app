import { Args, Int, Mutation, Resolver } from "@nestjs/graphql";
import { DepService } from "@/account/dep.service";
import { GqlAuthGuard } from "@/common/guards/gql-auth.guard";
import { UseGuards } from "@nestjs/common";

@Resolver()
@UseGuards(GqlAuthGuard)
export class DeleteDepResolver {
    constructor(private readonly depService: DepService) { }

    @Mutation(() => Boolean)
    async deleteDep(@Args({ name: 'id', type: () => Int }) id: number): Promise<boolean> {
        await this.depService.deleteByIds([id]);
        return true;
    }
}