import { gql } from "graphql-request";

export const GET_PLUGIN_INSTALLATIONS = gql`
  query($pluginIds: [String!]!) {
    listPluginFromIds(pluginIds: $pluginIds) {
      id,
      createdAt,
      updatedAt,
      name,
      pluginId,
      tenantId,
      version,
      meta
    }
  }
`
