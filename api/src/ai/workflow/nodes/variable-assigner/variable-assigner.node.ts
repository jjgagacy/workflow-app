import { BaseNode } from "../../entities/base-node.class";
import { NodeType } from "../../types/node-type.enum";
import { VariableAssignerNodeData } from "./variable-assigner-node.data";

export class VariableAssignerNode extends BaseNode<VariableAssignerNodeData> {
  protected nodeType: NodeType = NodeType.VariableAssigner;
  async run(): Promise<void> {
    throw new Error("Method not implemented.");
  }

  static version(): string {
    return "1";
  }

  static getDefaultConfig(filters?: Record<string, any>): Record<string, any> {
    return {};
  }
}
