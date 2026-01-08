import { Args, Query, Resolver } from "@nestjs/graphql";
import { RoleService } from "@/account/role.service";
import { RoleList } from "../types/role-list.type";
import { Role } from "../types/role.type";
import { RoleEntity } from "@/account/entities/role.entity";
import { formatDate } from "@/common/utils/time";
import { validNumber } from "@/common/utils/strings";
import { GqlAuthGuard } from "@/common/guards/gql-auth.guard";
import { UseGuards } from "@nestjs/common";
import { EditionSelfHostedGuard } from "@/common/guards/auth/edition_self_hosted.guard";
import { GetRoleArgs } from "../types/get-role.args";
import { CurrentTenent } from "@/common/decorators/current-tenant";

@Resolver()
@UseGuards(GqlAuthGuard)
@UseGuards(EditionSelfHostedGuard)
export class RoleResolver {
  constructor(private readonly roleService: RoleService) { }

  @Query((returns) => RoleList)
  async roles(@Args() args: GetRoleArgs, @CurrentTenent() tenant: any): Promise<RoleList> {
    const { data, total } = await this.roleService.query({
      id: args.id,
      key: args.key,
      name: args.name,
      parent: args.parent,
      order: { id: 'DESC' },
      tenantId: tenant.id,
      ...(args.hasMenus && ({ relations: { menus: true } }))
    });
    const roleList: Role[] = data.map(this.transformRoleToGraphqlType);

    if (args.hasRolePerms) {
      roleList.forEach(async (role) => {
        const perms = await this.roleService.getRolePerms(role.key);
        const rolePerms = perms.map(perm => ({
          key: perm.menu.key,
          scope: perm.scope.map(scope => scope.key),
          perms: perm.perms.map(perm => perm.key)
        }));
        role.rolePerms = rolePerms;
      })
    }

    return {
      data: roleList,
      ...(validNumber(args.page) && validNumber(args.limit) && {
        pageInfo: {
          page: args.page,
          pageSize: args.limit,
          total: total
        }
      })
    }
  }

  transformRoleToGraphqlType(role: RoleEntity): Role {
    return {
      id: role.id,
      key: role.key,
      parent: role.parent,
      name: role.name,
      status: role.status,
      created_at: formatDate(role.operate.createdAt),
      created_by: role.operate.createdBy,
    } as Role;
  }
}