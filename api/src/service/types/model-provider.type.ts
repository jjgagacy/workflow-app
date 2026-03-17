import { PluginProviderType } from "@/ai/model_runtime/classes/plugin/plugin";

export interface ModelProviderQueryProps {
  category?: PluginProviderType;
  excludes?: string[];
}
