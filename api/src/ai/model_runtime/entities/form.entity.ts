import { I18nObject } from "../classes/model-runtime.class";

export type Mapping<T = any> = Record<string, T>;

export enum FormType {
  text_input = 'text-input',
  secret_input = 'secret-input',
  number = 'number',
  select = 'select',
  radio = 'radio',
  switch = 'switch',
  boolean = 'boolean',
  any = 'any',
  files = 'files',
  file = 'file',
}

export enum CommonParameterType {
  string = "string",
  number = "number",
  boolean = "boolean",
  select = "select",
  secret_input = "secret-input",
  file = "file",
  files = "files",
  model_selector = "model-selector",
  app_selector = "app-selector",
  any = "any",
  object = "object",
  array = "array",
  dynamic_select = "dynamic-select"
}

export class FormOption {
  label: I18nObject;
  value: string;

  constructor(data: { label: I18nObject; value: string }) {
    this.label = data.label;
    this.value = data.value;

    if (!this.label && this.value) {
      this.label = new I18nObject({ en_US: this.value });
    }
  }
}

export interface CredentialFormSchemaProps {
  label: I18nObject;
  variable: string;
  type: FormType;

  required?: boolean;
  default?: string;

  options?: FormOption[];
  placeholder?: I18nObject;

  maxLength?: number;
}

export class CredentialFormSchema {
  label: I18nObject;
  variable: string;
  type: FormType;

  required: boolean;
  default?: string;

  options?: FormOption[];
  placeholder?: I18nObject;

  maxLength: number;

  constructor(props: CredentialFormSchemaProps) {
    this.label = props.label;
    this.variable = props.variable;
    this.type = props.type;

    this.required = props.required ?? true;
    this.default = props.default;

    this.options = props.options;
    this.placeholder = props.placeholder;

    this.maxLength = props.maxLength ?? 0;
  }
}

export function extractSecretVariables(credentialFormSchemas: CredentialFormSchema[]): string[] {
  const secretFormVariables: string[] = [];
  for (const credentialFormSchema of credentialFormSchemas) {
    if (credentialFormSchema.type === FormType.secret_input) {
      secretFormVariables.push(credentialFormSchema.variable);
    }
  }
  return secretFormVariables;
}
