import { Args, Mutation, Resolver } from "@nestjs/graphql";
import { MenuService } from "@/account/menu.service";
import { MenuResponse } from "../types/menu-response.type";
import { MenuInput } from "../types/menu-input.type";
import { BadRequestException } from "@nestjs/common";
import { errorObject } from "@/common/types/errors/error";
import { validId } from "@/common/utils/strings";

@Resolver()
export class CreateMenuResolver {
    constructor(private readonly menuService: MenuService) { }

    @Mutation(() => MenuResponse)
    async createMenu(@Args('input') input: MenuInput): Promise<MenuResponse> {
        const createRes = await this.menuService.create(input);
        const id = createRes?.id;
        if (!id || !validId(id)) throw new BadRequestException(errorObject("创建菜单失败"));
        return { id };
    }
}