import { ModelProviderDeclaration } from "../model-provider.class";
import { I18nObject } from "../model-runtime.class";
import { ModelWithProvider } from "../provider-model-status.class";
import { ToolProviderDeclaration } from "../tool-provider.class";
import { AgentStrategyDeclaration, AgentStrategyProviderIdentity } from "./agent";
import { EndpointDeclaration } from "./endpoint";
import { PluginManifest } from "./manifest";
import { PluginResourceRequirements } from "./permission";
import { PluginType } from "./plugin";
import { PluginMeta, PluginRunner } from "./runner";

export class PluginDeclaration {
  version: string = "";
  type: PluginType = PluginType.Plugin;
  author: string | null = null;
  label: I18nObject;
  name: string = "";
  repo: string | null = null;
  description: I18nObject;
  icon: string = "";
  iconDark: string = "";
  createdAt: Date = new Date();
  resource: PluginResourceRequirements = new PluginResourceRequirements();
  plugins: PluginManifest = new PluginManifest();
  meta: PluginMeta = new PluginMeta();

  model: ModelProviderDeclaration | null = null;
  tool: ToolProviderDeclaration | null = null;
  agentStrategy: AgentStrategyDeclaration | null = null;
  endpoint: EndpointDeclaration | null = null;

  constructor(data?: Partial<PluginDeclaration>) {
    this.label = new I18nObject({ en_US: this.name });
    this.description = new I18nObject({ en_US: this.name });

    if (data) {
      this.version = data.version || '';
      this.type = data.type || PluginType.Plugin;
      this.author = data.author ?? null;
      this.name = data.name || '';
      this.repo = data.repo || null;
      this.icon = data.icon || '';
      this.iconDark = data.iconDark || '';
      this.label = data.label || new I18nObject({ en_US: this.name });
      this.description = data.description || new I18nObject({ en_US: this.name });
      this.createdAt = data.createdAt ? new Date(data.createdAt) : new Date();

      if (data.resource) {
        this.resource = {
          memory: data.resource.memory || 0,
          permission: data.resource.permission
        } as PluginResourceRequirements;
      }

      this.plugins = new PluginManifest(data.plugins);

      if (data.meta) {
        this.meta = {
          version: data.meta.version || '',
          arch: data.meta.arch || [],
          runner: data.meta.runner || new PluginRunner(),
        } as PluginMeta;
      }
    }
  }


}