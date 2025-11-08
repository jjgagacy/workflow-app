import { Args, Mutation, Resolver } from "@nestjs/graphql";
import { RoleService } from "@/account/role.service";
import { RoleSetPermInput } from "../args/role-set-perm-input.args";
import { GqlAuthGuard } from "@/common/guards/gql-auth.guard";
import { UseGuards } from "@nestjs/common";
import { EditionSelfHostedGuard } from "@/common/guards/auth/edition_self_hosted.guard";

@Resolver()
@UseGuards(GqlAuthGuard)
@UseGuards(EditionSelfHostedGuard)
export class SetRolePermsResolver {
    constructor(private readonly roleService: RoleService) { }

    @Mutation(() => Boolean)
    async setRolePerms(@Args() input: RoleSetPermInput): Promise<boolean> {
        const dto = {
            key: input.key,
            menus: input.menus
        };
        await this.roleService.setRolePerms(dto);
        return true;
    }
}