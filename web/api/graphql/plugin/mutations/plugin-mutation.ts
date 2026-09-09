import { gql } from "graphql-request";

export const INSTALL_PLUGIN_FROM_MARKETPLACE = gql`
  mutation($identifiers: [String!]!) {
    installFromMarketplace(identifiers: $identifiers) {
      allInstalled,
    }
}`

export const UNINSTALL_PLUGIN_FROM_MARKETPLACE = gql`
  mutation($identifiers: [String!]!) {
    uninstallFromMarketplace(identifiers: $identifiers) {
      success,
    }
}`
