import { BaseNode } from "../../entities/base-node.class";
import { NodeType } from "../../types/node-type.enum";
import { LoopNodeData } from "./loop-node.data";

export class LoopNode extends BaseNode<LoopNodeData> {
  protected nodeType: NodeType = NodeType.Loop;
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
