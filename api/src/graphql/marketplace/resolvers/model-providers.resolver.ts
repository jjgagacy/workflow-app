import { Public } from "@/common/guards/universal-auth.guard";
import { Args, Mutation, Resolver } from "@nestjs/graphql";
import { ModelProviderService } from "@/service/model-provider.service";
import { GetModelProvidersArgs } from "../types/get-model-providers.args";
import { MarketplaceModelProviderResponse, MarketplaceModelProvidersListResponse } from "../types/model-providers-list.type";
import { MarketplaceService } from "@/service/marketplace.service";
import { PluginProviderType } from "@/ai/model_runtime/classes/plugin/plugin";
import { EnumConverter } from "@/common/utils/enums";
import { PluginDeclaration } from "@/ai/model_runtime/classes/plugin/declaration";
import { I18nObject } from "@/ai/model_runtime/classes/model-runtime.class";

@Resolver()
export class ModelProvidersResolver {
  constructor(
    private readonly marketplaceService: MarketplaceService,
    private readonly modelProviderService: ModelProviderService,
  ) { }

  @Public()
  @Mutation(() => MarketplaceModelProvidersListResponse)
  async marketplaceModelProviderList(
    @Args() args: GetModelProvidersArgs
  ): Promise<MarketplaceModelProvidersListResponse> {
    const pluginDeclarations = await this.marketplaceService.queryModelProviders({
      ...(args.category && { category: EnumConverter.toEnum(PluginProviderType, args.category) }),
      excludes: args.excludes,
      query: args.query,
    });

    const modelProviders = pluginDeclarations
      .map(declaration => this.transformToModelProvider(declaration));
    return { data: modelProviders };
  }

  private transformToModelProvider(declaration: PluginDeclaration): MarketplaceModelProviderResponse {
    const pluginId = `${declaration.author}/${declaration.name}`;
    const allIcons = declaration.model ? this.modelProviderService.getAllIconObject(pluginId) : null;
    return {
      providerType: this.marketplaceService.getModelProviderType(declaration),
      author: declaration.author || '',
      provider: declaration.model?.provider || '',
      name: declaration.name,
      icon: allIcons?.icon as I18nObject,
      iconSmall: allIcons?.iconSmall as I18nObject,
      iconDark: allIcons?.iconDark as I18nObject,
      iconSmallDark: allIcons?.iconSmallDark as I18nObject,
      label: declaration.label,
      description: declaration.description,
    };
  }
}