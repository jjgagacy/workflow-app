import { I18nObject } from "../i18n";

enum ParameterType {
  INT = 'INT',
  FLOAT = 'FLOAT',
  BOOLEAN = 'BOOLEAN',
  STRING = 'STRING',
  TEXT = 'TEXT'
}

export class ParameterOption {
  value: string;
  label: I18nObject;

  constructor(data: Partial<ParameterOption> = {}) {
    this.value = data.value || '';
    this.label = data.label || {};
  }
}

export class ParameterRule {
  name: string;
  type: ParameterType;
  required: boolean;
  default?: any;
  min?: number;
  max?: number;
  precision?: number;
  options?: string[];
  useTemplate?: string;

  constructor(data: Partial<ParameterRule>) {
    Object.assign(this, data);
    this.name = data.name || '';
    this.type = data.type || ParameterType.STRING;
    this.required = data.required || false;
    this.default = data.default;
  }
}
