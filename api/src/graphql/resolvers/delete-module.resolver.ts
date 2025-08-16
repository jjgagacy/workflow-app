import { Args, Int, Mutation, Resolver } from "@nestjs/graphql";
import { ModuleService } from "src/account/module.service";
import { GqlAuthGuard } from "src/common/guards/gql-auth.guard";
import { UseGuards } from "@nestjs/common";

@Resolver()
@UseGuards(GqlAuthGuard)
export class DeleteModuleResolver {
    constructor(private readonly moduleService: ModuleService) {}

    @Mutation(() => Boolean)
    async deleteModule(@Args({ name: 'id', type: () => Int}) id: number): Promise<Boolean> {
        await this.moduleService.deleteByIds([id]);
        return true;
    }
}