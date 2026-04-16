import { gql } from "graphql-request";

export const CREATE_APP = gql`
  mutation($input: CreateAppInput!) {
    createApp(input: $input) {
      id
    }
  }
`