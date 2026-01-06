import { Args, Int, Mutation, Resolver } from "@nestjs/graphql";
import { ModuleService } from "@/account/module.service";
import { GqlAuthGuard } from "@/common/guards/gql-auth.guard";
import { UseGuards } from "@nestjs/common";
import { EditionSelfHostedGuard } from "@/common/guards/auth/edition_self_hosted.guard";

@Resolver()
@UseGuards(GqlAuthGuard)
@UseGuards(EditionSelfHostedGuard)
export class DeleteModuleResolver {
    constructor(private readonly moduleService: ModuleService) { }

    @Mutation(() => Boolean)
    async deleteModule(@Args({ name: 'id', type: () => Int }) id: number): Promise<Boolean> {
        await this.moduleService.deleteByIds([id]);
        return true;
    }
}