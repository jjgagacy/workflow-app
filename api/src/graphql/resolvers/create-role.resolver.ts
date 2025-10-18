import { Args, Mutation, Resolver } from "@nestjs/graphql";
import { RoleService } from "@/account/role.service";
import { RoleResponse } from "../types/role-response.type";
import { CurrentUser } from "@/common/decorators/current-user";
import { RoleInput } from "../args/role.input.args";
import { UseGuards } from "@nestjs/common";
import { GqlAuthGuard } from "@/common/guards/gql-auth.guard";

@Resolver()
@UseGuards(GqlAuthGuard)
export class CreateRoleResolver {
    constructor(private readonly roleService: RoleService) { }

    @Mutation(() => RoleResponse)
    async createRole(@Args('input') input: RoleInput, @CurrentUser() user): Promise<RoleResponse> {
        const dto = {
            key: input.key || '',
            name: input.name || '',
            parent: input.parent || '',
            status: input.status || 0,
            createdBy: user.name as string
        };
        const createRes = await this.roleService.create(dto);
        const id = createRes.id;
        return { id };
    }
}