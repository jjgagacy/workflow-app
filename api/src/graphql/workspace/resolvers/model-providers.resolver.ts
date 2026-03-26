import { CurrentTenent } from "@/common/decorators/current-tenant";
import { AccountInitializedGuard } from "@/common/guards/auth/account-initialized.guard";
import { LoginRequiredGuard } from "@/common/guards/auth/login-required.guard";
import { TenantContextGuard } from "@/common/guards/tenant-context.guard";
import { ModelProviderList } from "@/graphql/model/model_provider/types/provider.type";
import { ModelProviderService } from "@/service/model-provider.service";
import { UseGuards } from "@nestjs/common/decorators/core/use-guards.decorator";
import { Args, Mutation, Query, Resolver } from "@nestjs/graphql";
import { CredentialInput, ProviderCredentialResponse } from "../types/provider.type";

@Resolver()
@UseGuards(LoginRequiredGuard)
export class ModelProviderListResolver {
  constructor(
    private readonly modelProviderService: ModelProviderService
  ) { }

  @Query(() => ModelProviderList)
  @UseGuards(AccountInitializedGuard)
  @UseGuards(TenantContextGuard)
  async modelProviderList(
    @CurrentTenent() tenant: any,
    @Args('modelType', { type: () => String, nullable: true }) modelType?: string,
  ): Promise<ModelProviderList> {
    return this.modelProviderService.getProviderList(tenant.id, modelType);
  }

  @Query(() => ProviderCredentialResponse)
  @UseGuards(AccountInitializedGuard)
  @UseGuards(TenantContextGuard)
  async providerCredentials(
    @CurrentTenent() tenant: any,
    @Args('providerName', { type: () => String }) providerName: string,
  ): Promise<ProviderCredentialResponse> {
    return this.modelProviderService.getProviderCredentials(tenant.id, providerName);
  }

  @Mutation(() => Boolean)
  @UseGuards(AccountInitializedGuard)
  @UseGuards(TenantContextGuard)
  async saveCredentials(
    @Args('input') input: CredentialInput,
    @CurrentTenent() tenant: any,
  ): Promise<boolean> {
    return this.modelProviderService.saveProviderCredentials(tenant.id, input.providerName, input.credentials);
  }
}
