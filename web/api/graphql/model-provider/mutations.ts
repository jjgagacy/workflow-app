import { gql } from "graphql-request";

export const SAVE_CREDENTIALS = gql`
  mutation SaveCredentials($input: CredentialInput!) {
    saveCredentials(input: $input)
  }
`;
