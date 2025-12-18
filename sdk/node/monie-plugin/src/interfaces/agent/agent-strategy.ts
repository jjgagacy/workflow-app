import { AgentInvokeMessage } from "@/core/entities/plugin/agent";
import { ToolLike } from "../tool/tool-like";

export abstract class AgentStrategy extends ToolLike<AgentInvokeMessage> {
  constructor() {
    super();
    this.responseType = AgentInvokeMessage;
  }
}
