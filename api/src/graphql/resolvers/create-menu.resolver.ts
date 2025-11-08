import { Args, Mutation, Resolver } from "@nestjs/graphql";
import { MenuService } from "@/account/menu.service";
import { MenuResponse } from "../types/menu-response.type";
import { MenuInput } from "../types/menu-input.type";
import { validId } from "@/common/utils/strings";
import { I18nTranslations } from "@/generated/i18n.generated";
import { I18nService } from "nestjs-i18n";
import { DatabaseGraphQLException } from "@/common/exceptions";
import { UseGuards } from "@nestjs/common";
import { EditionSelfHostedGuard } from "@/common/guards/auth/edition_self_hosted.guard";

@Resolver()
@UseGuards(EditionSelfHostedGuard)
export class CreateMenuResolver {
    constructor(
        private readonly menuService: MenuService,
        private readonly i18n: I18nService<I18nTranslations>
    ) { }

    @Mutation(() => MenuResponse)
    async createMenu(@Args('input') input: MenuInput): Promise<MenuResponse> {
        const createRes = await this.menuService.create(input);
        const id = createRes?.id;
        if (!id || !validId(id)) {
            throw new DatabaseGraphQLException(this.i18n.t('system.CREATE_FAILED_ID_INVALID'));
        }
        return { id };
    }
}