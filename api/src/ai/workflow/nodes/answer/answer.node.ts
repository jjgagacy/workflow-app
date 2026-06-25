import { BaseNode } from "../../entities/base-node.class";
import { NodeType } from "../../types/node-type.enum";
import { AnswerNodeData } from "./answer-node.data";

export class AnswerNode extends BaseNode<AnswerNodeData> {
  protected nodeType: NodeType = NodeType.Answer;

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
