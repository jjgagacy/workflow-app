import { gql } from "graphql-request";

export const LOGIN_RESPONSE_FIELDS = gql`
  fragment LoginResponseParts on LoginResponse {
    access_token,
    name,
    roles,
    isSuper,
    expiresIn
  }
`
