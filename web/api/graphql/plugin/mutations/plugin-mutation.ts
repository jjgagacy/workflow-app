import { gql } from "graphql-request";

export const INSTALL_PLUGIN_FROM_MARKETPLACE = gql`
  mutation($identifiers: [String!]!) {
    installFromMarketplace(identifiers: $identifiers) {
      allInstalled,
      taskId
    }
}`

export const UNINSTALL_PLUGIN_FROM_MARKETPLACE = gql`
  mutation($identifiers: [String!]!) {
    uninstallFromMarketplace(identifiers: $identifiers) {
      success,
    }
}`

export const CHECK_PLUGIN_INSTALLATION_TASK = gql`
  mutation($taskId: String) {
    checkPluginInstallationTask(taskId: $taskId) {
      success,
      taskInstallations,
    }
}`
