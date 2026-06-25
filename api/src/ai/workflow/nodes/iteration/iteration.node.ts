import { BaseNode } from "../../entities/base-node.class";
import { NodeType } from "../../types/node-type.enum";
import { IterationNodeData } from "./iteration-node.data";

export class IterationNode extends BaseNode<IterationNodeData> {
  protected nodeType: NodeType = NodeType.Iteration;

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
