import { I18nObject } from "../../types/i18n";

export interface ModelProvider {
  providerType: string;
  author: string;
  name: string;
  icon: string;
  label: I18nObject;
  description: I18nObject;
}
