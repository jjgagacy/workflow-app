import { I18N_FIELDS } from "./i18n";


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
