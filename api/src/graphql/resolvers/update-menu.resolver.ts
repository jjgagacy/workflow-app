import { Args, Mutation, Resolver } from "@nestjs/graphql";
import { MenuService } from "src/account/menu.service";
import { MenuResponse } from "../types/menu-response.type";
import { MenuInput } from "../types/menu-input.type";
import { BadRequestException } from "@nestjs/common";
import { errorObject } from "src/common/types/errors/error";
import { validId } from "src/common/utils/strings";
import { GqlAuthGuard } from "src/common/guards/gql-auth.guard";
import { UseGuards } from "@nestjs/common";

@Resolver()
@UseGuards(GqlAuthGuard)
export class UpdateMenuResolver {
    constructor(private readonly menuService: MenuService) {}

    @Mutation(() => MenuResponse)
    async updateMenu(@Args('input') input: MenuInput): Promise<MenuResponse> {
        const updateRes = await this.menuService.update(input);
        const id = updateRes?.id;
        if (!id || !validId(id)) throw new BadRequestException(errorObject("更新菜单失败"));
        return { id };
    }
}