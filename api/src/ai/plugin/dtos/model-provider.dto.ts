import { ModelProviderDeclaration } from "@/ai/model_runtime/classes/model-provider.class";

export const DEFAULT_PLUGIN_ID = 'monie';

export interface ModelProviderProps {
  id: string;
  pluginId: string;
  tenantId: string;
  provider: string;
  pluginUniqueIdentifier: string;
  declaration: ModelProviderDeclaration;
  createdAt?: Date;
  updatedAt?: Date;
}

export class ModelProvider {
  id: string;
  pluginId: string;
  tenantId: string;
  provider: string;
  pluginUniqueIdentifier: string;

  createdAt: Date;
  updatedAt: Date;

  declaration: ModelProviderDeclaration;

  constructor(props: ModelProviderProps) {
    this.id = props.id;
    this.pluginId = props.pluginId;
    this.tenantId = props.tenantId;
    this.provider = props.provider;
    this.pluginUniqueIdentifier = props.pluginUniqueIdentifier;
    this.declaration = props.declaration;

    this.createdAt = props.createdAt ?? new Date();
    this.updatedAt = props.updatedAt ?? new Date();
  }
}