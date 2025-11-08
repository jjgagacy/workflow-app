import { Args, Mutation, Resolver } from "@nestjs/graphql";
import { ModulePermManageService } from "@/account/module-perm-manage.service";
import { PermInput } from "../types/perm-input.type";
import { GqlAuthGuard } from "@/common/guards/gql-auth.guard";
import { UseGuards } from "@nestjs/common";
import { EditionSelfHostedGuard } from "@/common/guards/auth/edition_self_hosted.guard";

@Resolver()
@UseGuards(GqlAuthGuard)
@UseGuards(EditionSelfHostedGuard)
export class CreatePermResolver {
    constructor(private readonly modulePermManageService: ModulePermManageService) { }

    @Mutation(() => Boolean)
    async createPerm(@Args('input') input: PermInput): Promise<boolean> {
        await this.modulePermManageService.create(input);
        return true;
    }
}