export enum PluginInstallationSource {
  Github = "github",
  Marketplace = "marketplace",
  Package = "package",
  Remote = "remote"
}

export interface BasePlugin {
  id: string;
  created_at: Date;
  updated_at: Date;
}