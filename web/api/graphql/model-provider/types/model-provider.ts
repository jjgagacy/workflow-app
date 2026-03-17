import { I18nObject } from "../../types/i18n";

export interface ModelProvider {
  provider: string;
  icon: string;
  label: I18nObject;
  description: I18nObject;
}
