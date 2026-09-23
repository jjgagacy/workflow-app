import { Args, Query, Resolver } from '@nestjs/graphql';
import { FeatureService } from '@/service/feature.service';
import { SystemFeatures } from '../types/system-features.type';

@Resolver()
export class SystemFeaturesResolver {
  constructor(
    private readonly featureService: FeatureService,
  ) { }

  @Query(() => SystemFeatures, { name: 'systemFeatures' })
  async getSystemFeatures(
    @Args('tenantId', { nullable: true }) tenantId?: string,
  ): Promise<SystemFeatures> {
    const feature = await this.featureService.getFeatures(tenantId);

    return {
      enableChangeEmail: feature.enableChangeEmail ?? true,
      enableEmailCodeLogin: feature.enableEmailCodeLogin ?? false,
      enableEmailPasswordLogin: feature.enableEmailPasswordLogin ?? false,
      enableSocialOauthLogin: feature.enableSocialOauthLogin ?? false,
      canReplaceLogo: feature.canReplaceLogo ?? false,
      datasetOperatorEnabled: feature.datasetOperatorEnabled ?? false,
      defaultModelProviderSelectorList: feature.defaultModelProviderSelectorList ?? 'monyii/deepseek,monyii/tongyi',
      branding: {
        enabled: feature.branding?.enabled ?? false,
        applicationTitle: feature.branding?.applicationTitle ?? '',
        loginPageLogo: feature.branding?.loginPageLogo ?? '',
        workspaceLogo: feature.branding?.workspaceLogo ?? '',
        favicon: feature.branding?.favicon ?? '',
      },
      allowRegister: feature.allowRegister ?? false,
      allowCreateWorkSpace: feature.allowCreateWorkSpace ?? false,
      marketplaceEnabled: feature.marketplaceEnabled ?? false,
      license: {
        status: feature.license?.status ?? 'none',
        expiredAt: feature.license?.expiredAt ?? '',
        workspaces: {
          enabled: feature.license?.workspaces?.enabled ?? false,
          size: feature.license?.workspaces?.size ?? 0,
          limit: feature.license?.workspaces?.limit ?? 0,
        },
      },
    } satisfies SystemFeatures;
  }
}
