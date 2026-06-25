import { BaseNode } from "../../entities/base-node.class";
import { NodeType } from "../../types/node-type.enum";
import { DocumentExtractorNodeData } from "./document-extractor-node.data";

export class DocumentExtractorNode extends BaseNode<DocumentExtractorNodeData> {
  protected nodeType: NodeType = NodeType.DocumentExtractor;
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
