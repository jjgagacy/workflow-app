import { Args, Mutation, Resolver } from "@nestjs/graphql";
import { MenuService } from "@/account/menu.service";
import { MenuResponse } from "../types/menu-response.type";
import { MenuInput } from "../types/menu-input.type";
import { validId } from "@/common/utils/strings";
import { GqlAuthGuard } from "@/common/guards/gql-auth.guard";
import { UseGuards } from "@nestjs/common";
import { I18nTranslations } from "@/generated/i18n.generated";
import { I18nService } from "nestjs-i18n";
import { DatabaseGraphQLException } from "@/common/exceptions";
import { EditionSelfHostedGuard } from "@/common/guards/auth/edition_self_hosted.guard";

@Resolver()
@UseGuards(GqlAuthGuard)
@UseGuards(EditionSelfHostedGuard)
export class UpdateMenuResolver {
    constructor(
        private readonly menuService: MenuService,
        private readonly i18n: I18nService<I18nTranslations>
    ) { }

    @Mutation(() => MenuResponse)
    async updateMenu(@Args('input') input: MenuInput): Promise<MenuResponse> {
        const updateRes = await this.menuService.update(input);
        const id = updateRes?.id;
        if (!id || !validId(id)) throw new DatabaseGraphQLException(this.i18n.t('system.UPDATE_FAILED'))
        return { id };
    }
}