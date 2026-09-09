import { gql } from "graphql-request";
import { I18N_FIELDS } from "../../types/i18n";

export const GET_MODEL_PROVIDERS = gql`
  mutation($excludes: [String!], $category: String, $query: String) {
    marketplaceModelProviderList(excludes: $excludes, category: $category, query: $query) {
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
      pageInfo {
        page,
        pageSize,
        total
      }
    }
  }
`;
