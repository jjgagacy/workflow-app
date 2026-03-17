import { Public } from "@/common/guards/universal-auth.guard";
import { Args, Query, Resolver } from "@nestjs/graphql";
import { GetModelProvidersArgs } from "../types/get-model-providers.args";
import { ModelProvider, ModelProvidersList } from "../types/model-providers-list.type";
import { MarketplaceService } from "@/service/marketplace.service";
import { PluginProviderType } from "@/ai/model_runtime/classes/plugin/plugin";
import { EnumConverter } from "@/common/utils/enums";
import { PluginDeclaration } from "@/ai/model_runtime/classes/plugin/declaration";

@Resolver()
export class ModelProvidersResolver {
  constructor(private readonly marketplaceService: MarketplaceService) { }

  @Public()
  @Query(() => ModelProvidersList)
  async modelProviders(
    @Args() args: GetModelProvidersArgs
  ): Promise<ModelProvidersList> {
    const pluginDeclarations = await this.marketplaceService.queryModelProviders({
      ...(args.category && { category: EnumConverter.toEnum(PluginProviderType, args.category) }),
      excludes: args.excludes,
    });

    const modelProviders = pluginDeclarations
      .map(declaration => this.transformToModelProvider(declaration));
    return { data: modelProviders };
  }

  private transformToModelProvider(declaration: PluginDeclaration): ModelProvider {
    // Implementation for transforming PluginDeclaration to ModelProvidersList item
    const providerIconUrl = declaration.model ? this.marketplaceService.getModelProviderIconUrl(declaration.model.provider) : null;
    return {
      providerType: this.marketplaceService.getModelProviderType(declaration),
      author: declaration.author || '',
      name: declaration.name,
      icon: providerIconUrl || '',
      label: declaration.label,
      description: declaration.description,
    };
  }
}