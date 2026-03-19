import { gql } from "graphql-request";

export interface I18nObject {
  en_US: string;
  zh_Hans: string;
}

export const I18N_FIELDS = `
  en_US,
  zh_Hans
`;

export const CREDENTIAL_FORM_SCHEMA_FIELDS = `
  credentialFormSchema {
    variable,
    label {
      ${I18N_FIELDS}
    },
    type,
    required,
    placeholder {
      ${I18N_FIELDS}
    }
  }
`;
