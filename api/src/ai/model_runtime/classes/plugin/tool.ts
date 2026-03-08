import { CommonParameterType, Mapping } from "../../entities/form.entity";
import { I18nObject } from "../model-runtime.class";
import { ParameterOption } from "./parameter";

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
    this.label = data.label || new I18nObject({ en_US: this.name });
    this.humanDescription = data.humanDescription || new I18nObject({ en_US: this.name });
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