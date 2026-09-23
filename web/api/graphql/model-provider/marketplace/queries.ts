import { gql } from "graphql-request";
import { I18N_FIELDS } from "../../types/i18n";

export const GET_MODEL_PROVIDERS = gql`
  mutation($excludes: [String!], $category: String, $query: String) {
    marketplaceModelProviderList(excludes: $excludes, category: $category, query: $query) {
      data {
        providerType,
        author,
        provider,
        name,
        icon {
          ${I18N_FIELDS}
        },
        iconSmall {
          ${I18N_FIELDS}
        },
        iconDark {
          ${I18N_FIELDS}
        },
        iconSmallDark {
          ${I18N_FIELDS}
        },
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
