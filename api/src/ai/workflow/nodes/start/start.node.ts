import { BaseNode } from "../../entities/base-node.class";
import { NodeType } from "../../types/node-type.enum";
import { StartNodeData } from "./start-node.data";

export class StartNode extends BaseNode<StartNodeData> {
  protected nodeType: NodeType = NodeType.Start;
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
