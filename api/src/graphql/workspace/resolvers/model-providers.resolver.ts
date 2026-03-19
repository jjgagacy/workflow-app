import { CurrentTenent } from "@/common/decorators/current-tenant";
import { AccountInitializedGuard } from "@/common/guards/auth/account-initialized.guard";
import { LoginRequiredGuard } from "@/common/guards/auth/login-required.guard";
import { TenantContextGuard } from "@/common/guards/tenant-context.guard";
import { ModelProviderList } from "@/graphql/model/model_provider/types/provider.type";
import { ModelProviderService } from "@/service/model-provider.service";
import { UseGuards } from "@nestjs/common/decorators/core/use-guards.decorator";
import { Args, Query, Resolver } from "@nestjs/graphql";

@Resolver()
@UseGuards(LoginRequiredGuard)
export class ModelProviderListResolver {
  constructor(
    private readonly modelProviderService: ModelProviderService
  ) { }

  @Query(() => [ModelProviderList])
  @UseGuards(AccountInitializedGuard)
  @UseGuards(TenantContextGuard)
  async modelProviderList(
    @Args('modelType', { type: () => String }) modelType: string,
    @CurrentTenent() tenant: any
  ): Promise<ModelProviderList> {
    return this.modelProviderService.getProviderList(tenant.id, modelType);
  }
}
