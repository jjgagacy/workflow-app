import { gql } from "graphql-request";
import { I18N_FIELDS } from "../types/i18n";

export const GET_MODEL_PROVIDERS = gql`
  query($excludes: [String!], $category: String) {
    modelProviders(excludes: $excludes, category: $category) {
      data {
        providerType,
        author,
        name,
        icon,
        label {
          ${I18N_FIELDS}
        },
        description {
          ${I18N_FIELDS}
        }
      }
    }
  }
`