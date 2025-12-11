import { I18nObject } from "../i18n";

export class ParameterOption {
  value: string;
  label: I18nObject;

  constructor(data: Partial<ParameterOption> = {}) {
    this.value = data.value || '';
    this.label = data.label || {};
  }
}
