import { BaseNode } from "../../entities/base-node.class";
import { NodeType } from "../../types/node-type.enum";
import { IfElseNodeData } from "./if-else-node.data";

export class IfElseNode extends BaseNode<IfElseNodeData> {
  protected nodeType: NodeType = NodeType.IfElse;

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
