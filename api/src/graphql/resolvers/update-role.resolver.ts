import { Args, Mutation, Resolver } from "@nestjs/graphql";
import { RoleService } from "src/account/role.service";
import { RoleResponse } from "../types/role-response.type";
import { CurrentUser } from "src/common/decorators/current-user";
import { RoleInput } from "../args/role.input.args";
import { GqlAuthGuard } from "src/common/guards/gql-auth.guard";
import { UseGuards } from "@nestjs/common";

@Resolver()
@UseGuards(GqlAuthGuard)
export class UpdateRoleResolver {
    constructor(private readonly roleService: RoleService) {}

    @Mutation(() => RoleResponse)
    async updateRole(@Args('input') input: RoleInput, @CurrentUser() user): Promise<RoleResponse> {
        const dto = {
            id: input.id,
            key: input.key,
            name: input.name,
            parent: input.parent,
            status: input.status,
            updatedBy: user.name
        };
        const createRes = await this.roleService.update(dto);
        const id = createRes?.id || 0;
        return { id };
    }
}