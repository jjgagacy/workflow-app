import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { GqlExecutionContext } from "@nestjs/graphql";
import { AccountRoleService } from "src/account/account-role.service";
import { ROLES_KEY } from "src/common/decorators/roles.decorations";
import { Role } from "src/common/types/enums/role.enum";

@Injectable()
export class RolesGuard implements CanActivate {
    constructor(
        private reflector: Reflector,
        private readonly accountRoleService: AccountRoleService,
    ) {}

    async canActivate(context: ExecutionContext) {
        const ctx = GqlExecutionContext.create(context);
        const user = ctx.getContext().req.user;
        if (!user) {
            return false;
        }
        const userId = user.id;
        if (!userId) {
            return false;
        }
        const allowedRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
            context.getHandler(),
            context.getClass()
        ]);
        // 没有角色则不需要验证
        if (!allowedRoles) {
            return true;
        }
        const userRoles = await this.accountRoleService.getRoles({ id: userId });
        const roles = userRoles.map(userRole => userRole.key);
        return allowedRoles.some((role) => roles.indexOf(role) !== -1);
    }
}