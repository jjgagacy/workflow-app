import { Args, Int, Mutation, Resolver } from "@nestjs/graphql";
import { RoleService } from "src/account/role.service";
import { GqlAuthGuard } from "src/common/guards/gql-auth.guard";
import { UseGuards } from "@nestjs/common";

@Resolver()
@UseGuards(GqlAuthGuard)
export class DeleteRoleResolver {
    constructor(private readonly roleService: RoleService) {}

    @Mutation(() => Boolean)
    async deleteRole(@Args({ name: 'id', type: () => Int }) id: number,): Promise<boolean> {
        await this.roleService.deleteById(id);
        return true;
    }
}