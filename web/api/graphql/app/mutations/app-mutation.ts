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