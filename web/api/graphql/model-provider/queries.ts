import { gql } from "graphql-request";
import { I18N_FIELDS } from "../types/i18n";
import { CREDENTIAL_FORM_SCHEMA_FIELDS } from "../types/credentials";
import { QUOTA_FIELDS } from "../types/quota";

export const LIST_MODEL_PROVIDER = gql`
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
          quotaList {
            ${QUOTA_FIELDS}
          }
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
}`;