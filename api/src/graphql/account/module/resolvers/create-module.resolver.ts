import { Args, Mutation, Resolver } from "@nestjs/graphql";
import { ModuleService } from "@/account/module.service";
import { ModuleResponse } from "../types/module-response.type";
import { ModuleInput } from "../types/module-input.type";
import { GqlAuthGuard } from "@/common/guards/gql-auth.guard";
import { UseGuards } from "@nestjs/common";
import { EditionSelfHostedGuard } from "@/common/guards/auth/edition_self_hosted.guard";

@UseGuards(GqlAuthGuard)
@UseGuards(EditionSelfHostedGuard)
@Resolver()
export class CreateModuleResolver {
    constructor(
        private readonly moduleService: ModuleService
    ) { }

    @Mutation(() => ModuleResponse)
    async createModule(@Args('input') input: ModuleInput): Promise<ModuleResponse> {
        const moduleEntity = await this.moduleService.create(input);
        return { id: moduleEntity.id };
    }
}