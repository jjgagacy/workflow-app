import { BaseNode } from "../../entities/base-node.class";
import { NodeType } from "../../types/node-type.enum";
import { VariableAggregatorNodeData } from "./variable-aggregator-node.data";

export class VariableAggregatorNode extends BaseNode<VariableAggregatorNodeData> {
  protected nodeType: NodeType = NodeType.VariableAggregator;
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
