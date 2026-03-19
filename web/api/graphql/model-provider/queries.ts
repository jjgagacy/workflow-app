import { gql } from "graphql-request";
import { CREDENTIAL_FORM_SCHEMA_FIELDS, I18N_FIELDS } from "../types/i18n";

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

export const GET_MODEL_PROVIDER_LIST = gql`
  query($modelType: String) {
    modelProviderList(modelType: $modelType) {
      data {
      tenantId,
      providerName,
      label {
        ${I18N_FIELDS}
      },
      description {
        ${I18N_FIELDS}
      },
      icon {
       ${I18N_FIELDS} 
      },
      iconDark {
        ${I18N_FIELDS}
      },
      supportedModelTypes,
      preferredProviderType,
      customConfiguration {
        status
      },
      systemConfiguration {
        enabled,
        quotaList
      },
      providerCredentialSchema {
        ${CREDENTIAL_FORM_SCHEMA_FIELDS}
      },
      modelCredentialSchema {
        model {
          label {
            ${I18N_FIELDS}
          },
          placeholder {
            ${I18N_FIELDS}
          }
        }
        ${CREDENTIAL_FORM_SCHEMA_FIELDS}
      }
    }
  }
}
`