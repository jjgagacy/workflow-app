export type License = {
  status: string;
  expiredAt: string;
  workspaces: {
    enabled: boolean;
    size: number;
    limit: number;
  }
}

export type Branding = {
  enabled: boolean;
  applicationTitle: string;
  loginPageLogo: string;
  workspaceLogo: string;
  favicon: string;
}

export type SystemFeatures = {
  enableChangeEmail: boolean;
  enableEmailCodeLogin: boolean;
  enableEmailPasswordLogin: boolean;
  enableSocialOauthLogin: boolean;
  canReplaceLogo: boolean;
  datasetOperatorEnabled: boolean;
  marketplaceEnabled: boolean;
  defaultModelProviderSelectorList: string;
  branding: Branding;
  allowRegister: boolean;
  allowCreateWorkSpace: boolean;
  license: License;
}