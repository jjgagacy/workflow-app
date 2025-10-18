import { Args, Mutation, Resolver } from "@nestjs/graphql";
import { ModulePermManageService } from "@/account/module-perm-manage.service";
import { PermInput } from "../types/perm-input.type";
import { GqlAuthGuard } from "@/common/guards/gql-auth.guard";
import { UseGuards } from "@nestjs/common";

@Resolver()
@UseGuards(GqlAuthGuard)
export class DeletePermResolver {
    constructor(private readonly modulePermManageService: ModulePermManageService) { }

    @Mutation(() => Boolean)
    async deletePerm(@Args('input') input: PermInput): Promise<boolean> {
        await this.modulePermManageService.delete(input);
        return true;
    }
}