import { BaseNode, BaseNodeParams } from "./base-node.class";

export interface NodeClassSignature {
  getDefaultConfig(filters?: Record<string, any>): Record<string, any>;
  version(): string;
  new(params: BaseNodeParams): BaseNode;
}
