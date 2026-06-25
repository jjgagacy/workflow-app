import { BaseNode } from "../../entities/base-node.class";
import { NodeType } from "../../types/node-type.enum";
import { LLMNodeData } from "./llm-node.data";

export class LLMNode extends BaseNode<LLMNodeData> {
  protected nodeType: NodeType = NodeType.LLM;
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
