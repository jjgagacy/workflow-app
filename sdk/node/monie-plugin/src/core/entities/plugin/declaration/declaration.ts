import { I18nObject } from "../i18n";
import { PluginManifest } from "./declaration/manifest";
import { PluginResourceRequirements } from "./permission";
import { PluginType } from "../enums/plugin.type";
import { PluginMeta, PluginRunner } from "./runner";

export class PluginDeclaration {
  version: string = "";
  type: PluginType = PluginType.Plugin;
  author: string | null = null;
  name: string = "";
  repo: string | null = null;
  description: I18nObject = {};
  icon: string = "";
  label: I18nObject = {};
  createdAt: Date = new Date();
  resource: PluginResourceRequirements = new PluginResourceRequirements();
  plugins: PluginManifest = new PluginManifest();
  meta: PluginMeta = new PluginMeta();

  constructor(data?: Partial<PluginDeclaration>) {
    if (data) {
      this.version = data.version || '';
      this.type = data.type || PluginType.Plugin;
      this.author = data.author ?? null;
      this.name = data.name || '';
      this.repo = data.repo || null;
      this.icon = data.icon || '';
      this.label = data.label || {};
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
