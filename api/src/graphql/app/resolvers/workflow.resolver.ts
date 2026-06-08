import { AppsService } from "@/ai/apps/apps.service";
import { AccountInitializedGuard } from "@/common/guards/auth/account-initialized.guard";
import { TenantContextGuard } from "@/common/guards/tenant-context.guard";
import { AppManagerService } from "@/service/app-manager.service";
import { UseGuards } from "@nestjs/common";
import { Args, Query, Resolver } from "@nestjs/graphql";
import { CurrentTenent } from "@/common/decorators/current-tenant";
import { AccountService } from "@/account/account.service";
import { I18nTranslations } from "@/generated/i18n.generated";
import { I18nService } from "nestjs-i18n";
import { GraphQLJSON } from "graphql-type-json";

@Resolver()
export class WorkflowResolver {
  constructor(
    private readonly appsService: AppsService,
    private readonly appManagerService: AppManagerService,
    private readonly accountService: AccountService,
    private readonly i18n: I18nService<I18nTranslations>
  ) { }

  @Query(() => GraphQLJSON)
  @UseGuards(AccountInitializedGuard)
  @UseGuards(TenantContextGuard)
  async nodeDefaultValues(
    @CurrentTenent() tenant: any,
    @Args('nodeType', { type: () => String, nullable: false }) nodeType: string,
  ): Promise<object> {
    return {
      foo: 'bar',
    };
  }
}
