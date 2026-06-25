import { BaseNode } from "../../entities/base-node.class";
import { NodeType } from "../../types/node-type.enum";
import { FilterNodeData } from "./filer-node.data";

export class FilterNode extends BaseNode<FilterNodeData> {
  protected nodeType: NodeType = NodeType.Filter;

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
