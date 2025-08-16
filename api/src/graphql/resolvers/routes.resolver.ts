import { Query, Resolver } from "@nestjs/graphql";
import { Route } from "../types/route.type";
import { UseGuards } from "@nestjs/common";
import { GqlAuthGuard } from "src/common/guards/gql-auth.guard";
import { CurrentUser } from "src/common/decorators/current-user";
import { MenuService } from "src/account/menu.service";
import { MenuInterface } from "src/account/menu/interfaces/menu.interface";

@Resolver()
@UseGuards(GqlAuthGuard)
export class RoutesResolver {
    constructor(private readonly menuService: MenuService) {}

    @Query(() => [Route])
    // @UseGuards(RolesGuard)
    // @Roles(Role.Admin)
    async routes(@CurrentUser() user): Promise<Route[]> {
        const menus = await this.menuService.getMenus();
        const routeList: Route[] = [];
        const mapTree = (tree: MenuInterface[]) => {
            tree.map((leaf) => {
                const route: Route = {
                    key: leaf.key,
                    label: leaf.name,
                    roles: leaf.roles?.map((role) => role.key),
                    parent: leaf.parent,
                    sort: leaf.sort || 0,
                };
                routeList.push(route);
                if (leaf.children && leaf.children.length > 0) {
                    mapTree(leaf.children);
                }
            });
        };
        mapTree(menus);
        return routeList;
    }
}