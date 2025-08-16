import { Args, Mutation, Resolver } from "@nestjs/graphql";
import { RoleService } from "src/account/role.service";
import { RoleSetPermInput } from "../args/role-set-perm-input.args";
import { GqlAuthGuard } from "src/common/guards/gql-auth.guard";
import { UseGuards } from "@nestjs/common";

@Resolver()
@UseGuards(GqlAuthGuard)
export class SetRolePermsResolver {
    constructor(private readonly roleService: RoleService) {}

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