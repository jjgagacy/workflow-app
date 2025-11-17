import { I18nObject } from "../classes/model-runtime.class";

export enum FormType {
  TEXT_INPUT = 'text-input',
  SECRET_INPUT = 'secret-input',
  SELECT = 'select',
  RADIO = 'radio',
  SWITCH = 'switch',
}

export class FormOption {
  label: I18nObject;
  value: string;

  constructor(data: Partial<FormOption>) {
    Object.assign(this, data);

    if (!this.label && this.value) {
      this.label = new I18nObject({ en_US: this.value });
    }
  }
}

export class CredentialFormSchema {
  label: I18nObject;
  variable: string;
  type: FormType;

  required: boolean = true;
  default?: string;

  options?: FormOption[];
  placeholder?: I18nObject;

  maxLength?: number = 0;
}

export function extractSecretVariables(credentialFormSchemas: CredentialFormSchema[]): string[] {
  const secretFormVariables: string[] = [];
  for (const credentialFormSchema of credentialFormSchemas) {
    if (credentialFormSchema.type === FormType.SECRET_INPUT) {
      secretFormVariables.push(credentialFormSchema.variable);
    }
  }
  return secretFormVariables;
}
