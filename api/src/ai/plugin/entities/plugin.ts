export enum PluginInstallationSource {
  Github = "github",
  Marketplace = "marketplace",
  Package = "package",
  Remote = "remote"
}

export interface BasePlugin {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}