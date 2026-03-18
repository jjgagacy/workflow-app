import { PluginDeclaration } from "@/ai/model_runtime/classes/plugin/declaration";
import { BasePlugin, PluginInstallationSource } from "./plugin";

export interface PluginInstallation extends BasePlugin {
  tenant_id: string;
  endpointsSetups: number;
  endpointsActive: number;
  runtimeType: string;
  source: PluginInstallationSource;
  meta: Record<string, any>;
  pluginId: string;
  pluginUniqueIdentifier: string;
  version: string;
  checksum: string;
  declaration: PluginDeclaration;
  name: string;
  installationId: string;
}

export interface PluginListInstallation {
  list: PluginInstallation[];
  total: number;
}