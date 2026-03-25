import { AccountInitializedGuard } from "@/common/guards/auth/account-initialized.guard";
import { LoginRequiredGuard } from "@/common/guards/auth/login-required.guard";
import { TenantContextGuard } from "@/common/guards/tenant-context.guard";
import { ModelProviderService } from "@/service/model-provider.service";
import { UseGuards } from "@nestjs/common";
import { Args, Query, Resolver } from "@nestjs/graphql";
import { ModelCredentialResponse } from "../types/provider.type";
import { CurrentTenent } from "@/common/decorators/current-tenant";

@Resolver()
@UseGuards(LoginRequiredGuard)
export class ModelResolver {
  constructor(
    private readonly modelProviderService: ModelProviderService
  ) { }

  @Query(() => ModelCredentialResponse)
  @UseGuards(AccountInitializedGuard)
  @UseGuards(TenantContextGuard)
  async modelCredentials(
    @CurrentTenent() tenant: any,
    @Args('providerName', { type: () => String }) providerName: string,
    @Args('model', { type: () => String }) model: string,
    @Args('modelType', { type: () => String }) modelType: string,
  ): Promise<ModelCredentialResponse> {
    return this.modelProviderService.getModelCredentials(tenant.id, providerName, model, modelType);
  }
}