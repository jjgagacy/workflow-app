import { AppsService } from "@/ai/apps/apps.service";
import { AccountInitializedGuard } from "@/common/guards/auth/account-initialized.guard";
import { TenantContextGuard } from "@/common/guards/tenant-context.guard";
import { AppManagerService } from "@/service/app-manager.service";
import { UseGuards, BadRequestException } from "@nestjs/common";
import { Args, Query, Resolver, Mutation } from "@nestjs/graphql";
import { CurrentTenent } from "@/common/decorators/current-tenant";
import { AccountService } from "@/account/account.service";
import { I18nTranslations } from "@/generated/i18n.generated";
import { I18nService } from "nestjs-i18n";
import { GraphQLJSON } from "graphql-type-json";
import { WorkflowService } from "@/ai/workflow/workflow.service";
import { LoginRequiredGuard } from "@/common/guards/auth/login-required.guard";
import { AppsBillingGuard } from "@/common/guards/billing.guard";
import { CurrentUser } from "@/common/decorators/current-user";
import { AccountNotFoundError } from "@/service/exceptions/account.error";
import { WorkflowNotFoundError } from "@/service/exceptions/workflow.error";
import { WorkflowDraftInput } from "@/graphql/app/types/workflow.type";


@Resolver()
export class WorkflowResolver {
  constructor(
    private readonly appsService: AppsService,
    private readonly appManagerService: AppManagerService,
    private readonly accountService: AccountService,
    private readonly workflowService: WorkflowService,
    private readonly i18n: I18nService<I18nTranslations>
  ) { }

  @Query(() => GraphQLJSON)
  @UseGuards(AccountInitializedGuard)
  @UseGuards(TenantContextGuard)
  async nodeTypeDefaultConfig(
    @CurrentTenent() tenant: any,
    @Args('nodeType', { type: () => String, nullable: false }) nodeType: string,
    @Args('codeLanguage', { type: () => String, nullable: true }) codeLanguage?: string
  ): Promise<object> {
    const defaultConfig = this.workflowService.getNodeDefaultConfig(nodeType, codeLanguage ? { language: codeLanguage } : undefined);
    if (!defaultConfig) {
      return { type: nodeType, config: {} };
      // throw new Error(`Default config not found for node type: ${nodeType}`);
    }
    return defaultConfig;
  }


  @Mutation(() => GraphQLJSON)
  @UseGuards(LoginRequiredGuard)
  @UseGuards(TenantContextGuard)
  @UseGuards(AccountInitializedGuard)
  @UseGuards(AppsBillingGuard)
  async saveWorkflowDraft(
    @Args('input') input: WorkflowDraftInput,
    @CurrentUser() user: any,
    @CurrentTenent() tenant: any,
  ): Promise<any> {
    const account = await this.accountService.getById(user.id);
    if (!account) {
      throw AccountNotFoundError.create(this.i18n);
    }

    const { appId, graph, features, environmentVariables, sessionVariables } = input;

    const app = await this.appsService.getAppByIdAndTenant(appId, tenant.id);
    if (!app) {
      throw new BadRequestException(this.i18n.t('app.APP_NOT_FOUND'));
    }

    return this.workflowService.saveDraft(appId, tenant.id, {
      type: app.mode,
      graph,
      features,
      environmentVariables,
      sessionVariables,
      createdBy: account.username,
      updatedBy: account.username,
    });
  }

  @Mutation(() => Boolean)
  @UseGuards(LoginRequiredGuard)
  @UseGuards(TenantContextGuard)
  @UseGuards(AccountInitializedGuard)
  @UseGuards(AppsBillingGuard)
  async deleteWorkflow(
    @Args('appId', { type: () => String, nullable: false }) appId: string,
    @CurrentUser() user: any,
    @CurrentTenent() tenant: any,
  ): Promise<boolean> {
    const account = await this.accountService.getById(user.id);
    if (!account) {
      throw AccountNotFoundError.create(this.i18n);
    }

    const app = await this.appsService.getAppByIdAndTenant(appId, tenant.id);
    if (!app) {
      throw new BadRequestException(this.i18n.t('app.APP_NOT_FOUND'));
    }

    const workflow = await this.workflowService.getByAppIdAndTenant(appId, tenant.id);
    if (!workflow) {
      throw WorkflowNotFoundError.create(this.i18n);
    }

    await this.workflowService.delete(workflow.id, tenant.id);
    return true;
  }

  @Query(() => GraphQLJSON)
  @UseGuards(LoginRequiredGuard)
  @UseGuards(TenantContextGuard)
  @UseGuards(AccountInitializedGuard)
  @UseGuards(AppsBillingGuard)
  async getWorkflowDraft(
    @Args('appId', { type: () => String, nullable: false }) appId: string,
    @CurrentUser() user: any,
    @CurrentTenent() tenant: any,
  ): Promise<any> {
    const account = await this.accountService.getById(user.id);
    if (!account) {
      throw AccountNotFoundError.create(this.i18n);
    }

    const app = await this.appsService.getAppByIdAndTenant(appId, tenant.id);
    if (!app) {
      throw new BadRequestException(this.i18n.t('app.APP_NOT_FOUND'));
    }

    const workflow = await this.workflowService.getByAppIdAndTenant(appId, tenant.id);
    if (!workflow) {
      throw WorkflowNotFoundError.create(this.i18n);
    }

    return this.workflowService.transformWorkflow(workflow);
  }
}
