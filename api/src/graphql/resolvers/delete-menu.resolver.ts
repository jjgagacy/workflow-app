import { Args, Int, Mutation, Resolver } from "@nestjs/graphql";
import { MenuService } from "src/account/menu.service";
import { GqlAuthGuard } from "src/common/guards/gql-auth.guard";
import { UseGuards } from "@nestjs/common";

@Resolver()
@UseGuards(GqlAuthGuard)
export class DeleteMenuResolver {
    constructor(private readonly menuService: MenuService) {}

    @Mutation(() => Boolean)
    async deleteMenu(@Args({ name: 'id', type: () => Int}) id: number): Promise<boolean> {
        await this.menuService.deleteById(id);
        return true;
    }
}