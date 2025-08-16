import { Args, Mutation, Resolver } from "@nestjs/graphql";
import { ModulePermManageService } from "src/account/module-perm-manage.service";
import { PermInput } from "../types/perm-input.type";
import { GqlAuthGuard } from "src/common/guards/gql-auth.guard";
import { UseGuards } from "@nestjs/common";

@Resolver()
@UseGuards(GqlAuthGuard)
export class CreatePermResolver {
    constructor(private readonly modulePermManageService: ModulePermManageService) {}

    @Mutation(() => Boolean)
    async createPerm(@Args('input') input: PermInput): Promise<boolean> {
        await this.modulePermManageService.create(input);
        return true;
    }
}