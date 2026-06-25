import { BaseNode } from "../../entities/base-node.class";
import { NodeType } from "../../types/node-type.enum";
import { ParameterExtractorNodeData } from "./parameter-extractor-node.data";

export class ParameterExtractorNode extends BaseNode<ParameterExtractorNodeData> {
  protected nodeType: NodeType = NodeType.ParameterExtractor;
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
