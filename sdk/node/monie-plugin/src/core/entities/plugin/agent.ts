import { I18nObject } from "../i18n";
import { Mapping } from "./provider";
import { ToolConfigurationExtra, ToolIdentity, ToolParameterOption, ToolProviderIdentity } from "./tool";

export class AgentStrategyProviderIdentity extends ToolProviderIdentity { }

export class AgentStrategyIdentity extends ToolIdentity { }

export class AgentStrategyConfigurationExtra extends ToolConfigurationExtra { }

export enum AgentStrategyFeature {
  HISTORY_MESSGAES = "history-messages"
}

export class AgentStrategyParameter {
  name: string;
  label: I18nObject;
  help?: I18nObject;
  type: string;
  scope?: string;
  required: boolean = false;
  defaultValue?: number | string | undefined;
  min?: number | undefined;
  max?: number | undefined;
  precision?: number | undefined;
  options?: ToolParameterOption[];

  constructor(data: Partial<AgentStrategyParameter>) {
    this.name = data.name || '';
    this.label = data.label || {};
    this.help = data.help || {};
    this.type = data.type || '';
    this.scope = data.scope || '';
    this.required = data.required || false;
    this.defaultValue = data.defaultValue || undefined;
    this.min = data.min || undefined;
    this.max = data.max || undefined;
    this.precision = data.precision || undefined;
    this.options = data.options || [];
  }
}

export class AgentStrategyConfiguration {
  identity: AgentStrategyIdentity;
  parameters: AgentStrategyParameter[] = [];
  description: I18nObject;
  extra: AgentStrategyConfigurationExtra;
  outputSchema?: Mapping | undefined;
  features: AgentStrategyFeature[] = [];

  constructor(data: Partial<AgentStrategyConfiguration>) {
    this.identity = data.identity || new AgentStrategyIdentity();
    this.parameters = data.parameters || [];
    this.description = data.description || {};
    this.extra = data.extra || new AgentStrategyConfigurationExtra();
    this.outputSchema = data.outputSchema;
    this.features = data.features || [];
  }
}

