import { BaseNode } from "../../entities/base-node.class";
import { NodeType } from "../../types/node-type.enum";
import { TemplateTransformNodeData } from "./template-transform-node.data";

export class TemplateTransformNode extends BaseNode<TemplateTransformNodeData> {
  protected nodeType: NodeType = NodeType.TemplateTransform;
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
