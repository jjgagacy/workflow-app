import { AgentInvokeMessage } from "@/core/entities/plugin/agent";
import { ToolLike } from "../tool/tool-like";
import { Session } from "@/core/classes/runtime";

export class AgentRuntime {
  constructor(
    public userId?: string
  ) { }
}

export abstract class AgentStrategy extends ToolLike<AgentInvokeMessage> {
  agentRuntime: AgentRuntime;
  session: Session;

  constructor(runtime: AgentRuntime, session: Session) {
    super();
    this.responseType = AgentInvokeMessage;
    this.agentRuntime = runtime;
    this.session = session;
  }

  abstract invoke(agentParameters: Record<string, any>):
    AsyncGenerator<AgentInvokeMessage> |
    Iterable<AgentInvokeMessage> |
    Promise<AgentInvokeMessage>;
}
