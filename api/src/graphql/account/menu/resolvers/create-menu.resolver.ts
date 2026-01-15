import { Args, Mutation, Resolver } from "@nestjs/graphql";
import { MenuService } from "@/account/menu.service";
import { validId } from "@/common/utils/strings";
import { I18nTranslations } from "@/generated/i18n.generated";
import { I18nService } from "nestjs-i18n";
import { DatabaseGraphQLException } from "@/common/exceptions";
import { UseGuards } from "@nestjs/common";
import { EditionSelfHostedGuard } from "@/common/guards/auth/edition_self_hosted.guard";
import { MenuResponse } from "../types/menu-response.type";
import { MenuInput } from "../types/menu-input.type";
import { CurrentTenent } from "@/common/decorators/current-tenant";
import { TenantContextGuard } from "@/common/guards/tenant-context.guard";
import { GqlAuthGuard } from "@/common/guards/gql-auth.guard";

@Resolver()
@UseGuards(GqlAuthGuard)
@UseGuards(TenantContextGuard)
@UseGuards(EditionSelfHostedGuard)
export class CreateMenuResolver {
  constructor(
    private readonly menuService: MenuService,
    private readonly i18n: I18nService<I18nTranslations>
  ) { }

  @Mutation(() => MenuResponse)
  async createMenu(@Args('input') input: MenuInput, @CurrentTenent() tenant: any): Promise<MenuResponse> {
    const createRes = await this.menuService.create({ ...input, tenantId: tenant.id });
    const id = createRes?.id;
    if (!id || !validId(id)) {
      throw new DatabaseGraphQLException(this.i18n.t('system.CREATE_FAILED_ID_INVALID'));
    }
    return { id };
  }
}