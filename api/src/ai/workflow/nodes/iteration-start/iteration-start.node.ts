import { BaseNode } from "../../entities/base-node.class";
import { NodeType } from "../../types/node-type.enum";
import { IterationStartNodeData } from "./iteration-start-node.data";

export class IterationStartNode extends BaseNode<IterationStartNodeData> {
  protected nodeType: NodeType = NodeType.IterationStart;
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
