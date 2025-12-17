import { CommonParameterType } from "../enums/form.enum";
import { I18nObject } from "../i18n";
import { ToolConfigurationExtra } from "./extra";
import { ParameterOption } from "./parameter";
import { Mapping } from "./provider";

export type ToolParameterOption = ParameterOption;

export enum ToolParameterType {
  STRING = CommonParameterType.STRING,
  NUMBER = CommonParameterType.NUMBER,
  BOOLEAN = CommonParameterType.BOOLEAN,
  SELECT = CommonParameterType.SELECT,
  SECRET_INPUT = CommonParameterType.SECRET_INPUT,
  FILE = CommonParameterType.FILE,
  FILES = CommonParameterType.FILES,
  MODEL_SELECTOR = CommonParameterType.MODEL_SELECTOR,
  APP_SELECTOR = CommonParameterType.APP_SELECTOR,
  ANY = CommonParameterType.ANY,
  OBJECT = CommonParameterType.OBJECT,
  ARRAY = CommonParameterType.ARRAY,
  DYNAMIC_SELECT = CommonParameterType.DYNAMIC_SELECT
}

export enum ToolParameterForm {
  SCHEMA = "schema",
  FORM = "form",
  LLM = "llm",
}

export class ToolParameter {
  name: string;
  label: I18nObject;
  humanDescription: I18nObject;
  type: ToolParameterType;
  scope?: string | undefined;
  form: ToolParameterForm;
  required: boolean = false;
  default?: number | string | undefined;
  min?: number | undefined;
  max?: number | undefined;
  precision?: number | undefined;
  options?: ToolParameterOption[];
  inputSchema?: Mapping | undefined;

  constructor(data: Partial<ToolParameter>) {
    this.name = data.name || '';
    this.label = data.label || {};
    this.humanDescription = data.humanDescription || {};
    this.type = data.type || ToolParameterType.STRING;
    this.scope = data.scope;
    this.form = data.form || ToolParameterForm.FORM;
    this.required = data.required || false;
    this.default = data.default;
    this.min = data.min;
    this.max = data.max;
    this.precision = data.precision;
    this.options = data.options || [];
    this.inputSchema = data.inputSchema;
  }
}

export class ToolIdentity {
  author: string;
  name: string;
  label: I18nObject;

  constructor(data: Partial<ToolIdentity> = {}) {
    this.author = data.author || '';
    this.name = data.name || '';
    this.label = data.label || {};
  }
}

export class ToolProviderIdentity {
  name: string;
  label: I18nObject;
  description: I18nObject;
  icon?: string;
  supportedFileUploadMethods?: string;

  constructor(data: Partial<ToolProviderIdentity> = {}) {
    this.name = data.name || '';
    this.label = data.label || {};
    this.description = data.description || {};
    this.icon = data.icon || '';
    this.supportedFileUploadMethods = data.supportedFileUploadMethods || '';
  }
}

export class ToolDescription {
  human: I18nObject;

  constructor(data: Partial<ToolDescription> = {}) {
    this.human = data.human || {};
  }
}

export class ToolConfiguration {
  identity: ToolIdentity;
  parameters: ToolParameter[] = [];
  description: ToolDescription;
  extra: ToolConfigurationExtra;
  outputSchema?: Mapping | undefined;

  constructor(data: Partial<ToolConfiguration>) {
    this.identity = data.identity || new ToolIdentity();
    this.parameters = data.parameters || [];
    this.description = data.description || new ToolDescription();
    this.extra = data.extra || new ToolConfigurationExtra();
    this.outputSchema = data.outputSchema;
  }
}

export const ToolLabel = {
  SEARCH: "search",
  IMAGE: "image",
  VIDEOS: "videos",
  WEATHER: "weather",
  FINANCE: "finance",
  DESIGN: "design",
  TRAVEL: "travel",
  SOCIAL: "social",
  NEWS: "news",
  MEDICAL: "medical",
  PRODUCTIVITY: "productivity",
  EDUCATION: "education",
  BUSINESS: "business",
  ENTERTAINMENT: "entertainment",
  UTILITIES: "utilities",
  OTHER: "other"
} as const;

export type ToolLabelType = typeof ToolLabel[keyof typeof ToolLabel];

export function getToolLabel(label: ToolLabelType): string {
  return label;
}

