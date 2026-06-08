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
