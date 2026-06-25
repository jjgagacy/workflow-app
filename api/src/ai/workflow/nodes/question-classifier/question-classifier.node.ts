import { BaseNode } from "../../entities/base-node.class";
import { NodeType } from "../../types/node-type.enum";
import { QuestionClassifierNodeData } from "./question-classifier-node.data";

export class QuestionClassifierNode extends BaseNode<QuestionClassifierNodeData> {
  protected nodeType: NodeType = NodeType.QuestionClassifier;
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
