import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType('LicenseWorkspaceLimit')
export class LicenseWorkspaceLimit {
  @Field(() => Boolean)
  enabled!: boolean;

  @Field(() => Number)
  size!: number;

  @Field(() => Number)
  limit!: number;
}

@ObjectType('License')
export class License {
  @Field(() => String)
  status!: string;

  @Field(() => String)
  expiredAt!: string;

  @Field(() => LicenseWorkspaceLimit)
  workspaces!: LicenseWorkspaceLimit;
}

@ObjectType('Branding')
export class Branding {
  @Field(() => Boolean)
  enabled!: boolean;

  @Field(() => String)
  applicationTitle!: string;

  @Field(() => String)
  loginPageLogo!: string;

  @Field(() => String)
  workspaceLogo!: string;

  @Field(() => String)
  favicon!: string;
}

@ObjectType('SystemFeatures')
export class SystemFeatures {
  @Field(() => Boolean)
  enableChangeEmail!: boolean;

  @Field(() => Boolean)
  enableEmailCodeLogin!: boolean;

  @Field(() => Boolean)
  enableEmailPasswordLogin!: boolean;

  @Field(() => Boolean)
  enableSocialOauthLogin!: boolean;

  @Field(() => Boolean)
  canReplaceLogo!: boolean;

  @Field(() => Boolean)
  datasetOperatorEnabled!: boolean;

  @Field(() => Boolean)
  marketplaceEnabled!: boolean;

  @Field(() => String)
  defaultModelProviderSelectorList!: string;

  @Field(() => Branding)
  branding!: Branding;

  @Field(() => Boolean)
  allowRegister!: boolean;

  @Field(() => Boolean)
  allowCreateWorkSpace!: boolean;

  @Field(() => License)
  license!: License;
}
