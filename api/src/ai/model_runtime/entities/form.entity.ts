import { I18nObject } from "../classes/model-runtime.class";

export type Mapping<T = any> = Record<string, T>;

export enum FormType {
  TEXT_INPUT = 'text-input',
  SECRET_INPUT = 'secret-input',
  NUMBER = 'number',
  SELECT = 'select',
  RADIO = 'radio',
  SWITCH = 'switch',
  BOOLEAN = 'boolean',
  ANY = 'any',
  FILES = 'files',
  FILE = 'file',
}

export enum CommonParameterType {
  STRING = "string",
  NUMBER = "number",
  BOOLEAN = "boolean",
  SELECT = "select",
  SECRET_INPUT = "secret-input",
  FILE = "file",
  FILES = "files",
  MODEL_SELECTOR = "model-selector",
  APP_SELECTOR = "app-selector",
  ANY = "any",
  OBJECT = "object",
  ARRAY = "array",
  DYNAMIC_SELECT = "dynamic-select"
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
    if (credentialFormSchema.type === FormType.SECRET_INPUT) {
      secretFormVariables.push(credentialFormSchema.variable);
    }
  }
  return secretFormVariables;
}
