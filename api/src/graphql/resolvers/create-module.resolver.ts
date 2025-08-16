import { Args, Mutation, Resolver } from "@nestjs/graphql";
import { ModuleService } from "src/account/module.service";
import { ModuleResponse } from "../types/module-response.type";
import { ModuleInput } from "../types/module-input.type";
import { GqlAuthGuard } from "src/common/guards/gql-auth.guard";
import { UseGuards } from "@nestjs/common";

@UseGuards(GqlAuthGuard)
@Resolver()
export class CreateModuleResolver {
    constructor(
        private readonly moduleService: ModuleService
    ) {}

    @Mutation(() => ModuleResponse)
    async createModule(@Args('input') input: ModuleInput): Promise<ModuleResponse> {
        const moduleEntity = await this.moduleService.create(input);
        return { id: moduleEntity.id };
    }
}