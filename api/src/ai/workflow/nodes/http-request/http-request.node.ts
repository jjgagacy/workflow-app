import { BaseNode } from "../../entities/base-node.class";
import { NodeType } from "../../types/node-type.enum";
import { HttpRequestNodeData } from "./http-request-node.data";

export class HttpRequestNode extends BaseNode<HttpRequestNodeData> {
  protected nodeType: NodeType = NodeType.HttpRequest;

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
