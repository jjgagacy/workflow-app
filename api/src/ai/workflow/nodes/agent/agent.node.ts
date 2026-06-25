import { BaseNode } from "../../entities/base-node.class";
import { NodeType } from "../../types/node-type.enum";
import { AgentNodeData } from "./agent-node.data";

export class AgentNode extends BaseNode<AgentNodeData> {
  protected nodeType: NodeType = NodeType.Agent;

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
