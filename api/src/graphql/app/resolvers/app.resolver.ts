import { AppsService } from "@/ai/apps/apps.service";
import { AccountInitializedGuard } from "@/common/guards/auth/account-initialized.guard";
import { LoginRequiredGuard } from "@/common/guards/auth/login-required.guard";
import { AppsBillingGuard } from "@/common/guards/billing.guard";
import { TenantContextGuard } from "@/common/guards/tenant-context.guard";
import { AppManagerService } from "@/service/app-manager.service";
import { BadRequestException, UseGuards } from "@nestjs/common";
import { Args, Resolver } from "@nestjs/graphql";
import { CreateAppInput, CreateAppResponse } from "../types/app-input.type";
import { CurrentUser } from "@/common/decorators/current-user";
import { CurrentTenent } from "@/common/decorators/current-tenant";
import { AccountService } from "@/account/account.service";
import { AccountNotFoundError } from "@/service/exceptions/account.error";
import { I18nTranslations } from "@/generated/i18n.generated";
import { I18nService } from "nestjs-i18n";

@Resolver()
export class AppResolver {
  constructor(
    private readonly appsService: AppsService,
    private readonly appManagerService: AppManagerService,
    private readonly accountService: AccountService,
    private readonly i18n: I18nService<I18nTranslations>
  ) { }

  @UseGuards(LoginRequiredGuard)
  @UseGuards(TenantContextGuard)
  @UseGuards(AccountInitializedGuard)
  @UseGuards(AppsBillingGuard)
  async createApp(
    @Args('input') input: CreateAppInput,
    @CurrentUser() user: any,
    @CurrentTenent() tenant: any
  ): Promise<CreateAppResponse> {
    const account = await this.accountService.getById(user.id);
    if (!account) {
      throw AccountNotFoundError.create(this.i18n);
    }
    const app = await this.appManagerService.createApp(tenant.id, input, account);
    return { id: app.id };
  }

}