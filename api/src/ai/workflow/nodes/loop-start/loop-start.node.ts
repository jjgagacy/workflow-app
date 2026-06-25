import { BaseNode } from "../../entities/base-node.class";
import { NodeType } from "../../types/node-type.enum";
import { LoopStartNodeData } from "./loop-start-node.data";

export class LoopStartNode extends BaseNode<LoopStartNodeData> {
  protected nodeType: NodeType = NodeType.LoopStart;
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
