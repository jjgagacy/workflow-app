import { gql } from 'graphql-request';

export const GET_APP_INFO = gql`
  query GetAppInfo($appId: String!) {
    appInfo(appId: $appId) {
      id
      name
      description
      mode
      icon
      iconType
      enableSite
      enableApi
      isPublic
      createdAt
      createdBy
      updatedAt
      updatedBy
    }
  }
`;

export const GET_SYSTEM_FEATURES = gql`
  query GetSystemFeatures($tenantId: String) {
    systemFeatures(tenantId: $tenantId) {
      enableChangeEmail
      enableEmailCodeLogin
      enableEmailPasswordLogin
      enableSocialOauthLogin
      canReplaceLogo
      datasetOperatorEnabled
      defaultModelProviderSelectorList
      marketplaceEnabled
      branding {
        enabled
        applicationTitle
        loginPageLogo
        workspaceLogo
        favicon
      }
      allowRegister
      allowCreateWorkSpace
      license {
        status
        expiredAt
        workspaces {
          enabled
          size
          limit
        }
      }
    }
  }
`;
