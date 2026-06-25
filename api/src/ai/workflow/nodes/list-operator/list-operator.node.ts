import { BaseNode } from "../../entities/base-node.class";
import { NodeType } from "../../types/node-type.enum";
import { ListOperatorNodeData } from "./list-operator-node.data";

export class ListOperatorNode extends BaseNode<ListOperatorNodeData> {
  protected nodeType: NodeType = NodeType.ListOperator;
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
