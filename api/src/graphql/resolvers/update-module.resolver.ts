import { Args, Mutation, Resolver } from "@nestjs/graphql";
import { ModuleService } from "@/account/module.service";
import { ModuleResponse } from "../types/module-response.type";
import { ModuleInput } from "../types/module-input.type";
import { GqlAuthGuard } from "@/common/guards/gql-auth.guard";
import { UseGuards } from "@nestjs/common";
import { EditionSelfHostedGuard } from "@/common/guards/auth/edition_self_hosted.guard";

@Resolver()
@UseGuards(GqlAuthGuard)
@UseGuards(EditionSelfHostedGuard)
export class UpdateModuleResolver {
    constructor(
        private readonly moduleService: ModuleService
    ) { }

    @Mutation(() => ModuleResponse)
    async updateModule(@Args('input') input: ModuleInput): Promise<ModuleResponse> {
        const moduleEntity = await this.moduleService.update({ ...input, id: input.id! });
        return { id: moduleEntity.id };
    }
}