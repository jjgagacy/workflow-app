import { Args, Int, Query, Resolver } from "@nestjs/graphql";
import { MenuService } from "@/account/menu.service";
import { Menu } from "../types/menu.type";
import { GetMenuArgs } from "../args/get-menu.args";
import { GqlAuthGuard } from "@/common/guards/gql-auth.guard";
import { BadRequestException, UseGuards } from "@nestjs/common";
import { errorObject } from "@/common/types/errors/error";
import { ModuleService } from "@/account/module.service";
import { ModulePermInterface } from "@/account/interfaces/module-perm.interface";

@Resolver()
@UseGuards(GqlAuthGuard)
export class MenuResolver {
    constructor(
        private readonly menuService: MenuService,
        private readonly moduleService: ModuleService
    ) { }

    @Query(() => [Menu])
    async menus(@Args() args: GetMenuArgs): Promise<Menu[]> {
        const menuList = await this.menuService.getFlatMenus({ ...args, withModule: args.module });
        return menuList.map(this.transformMenuToGQLType);
    }

    transformMenuToGQLType(menu: any): Menu {
        return {
            id: menu.id,
            key: menu.key,
            name: menu.name,
            parent: menu.parent,
            status: menu.status,
            sort: menu.sort,
            module: menu.module,
            modulePerm: menu.modulePerm,
            scope: menu.scope ? menu.scope : null,
        } as Menu;
    }

    @Query(() => Menu)
    async menuInfo(@Args({ name: 'id', type: () => Int }) id: number): Promise<Menu> {
        const menu = await this.menuService.getById(id);
        if (!menu) {
            throw new BadRequestException(errorObject('参数key错误', { id }));
        }

        let modulePerm: ModulePermInterface[] | undefined = undefined;
        if (menu.module) {
            const perms = await this.moduleService.getModulePerms(menu.module.key);
            if (perms) {
                modulePerm = perms.map(perm => ({
                    key: perm.key,
                    name: perm.name,
                    restrictLevel: perm.restrictLevel
                }));
            }
        }

        return {
            ...this.transformMenuToGQLType(menu),
            modulePerm: modulePerm
        }
    }
}