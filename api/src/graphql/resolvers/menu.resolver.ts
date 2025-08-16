import { Args, Query, Resolver } from "@nestjs/graphql";
import { MenuService } from "src/account/menu.service";
import { Menu } from "../types/menu.type";
import { GetMenuArgs } from "../args/get-menu.args";
import { GqlAuthGuard } from "src/common/guards/gql-auth.guard";
import { UseGuards } from "@nestjs/common";

@Resolver()
@UseGuards(GqlAuthGuard)
export class MenuResolver {
    constructor(private readonly menuService: MenuService) {}

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
}