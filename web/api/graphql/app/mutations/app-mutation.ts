import { gql } from "graphql-request";

export const CREATE_APP = gql`
  mutation($input: CreateAppInput!) {
    createApp(input: $input) {
      id
    }
  }
`;

export const UPDATE_APP = gql`
  mutation($appId: String!, $input: UpdateAppInput!) {
    updateApp(appId: $appId, input: $input)
  }
`;

export const DELETE_APP = gql`
  mutation($appId: String!) {
    deleteApp(appId: $appId)
  }
`;

export const UPDATE_APP_NAME = gql`
  mutation($appId: String!, $name: String!) {
    updateAppName(appId: $appId, name: $name)
  }
`;
