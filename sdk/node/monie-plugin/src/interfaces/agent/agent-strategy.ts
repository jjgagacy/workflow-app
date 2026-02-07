import { AgentInvokeMessage } from "../../core/entities/plugin/agent.js";
import { ToolLike } from "../tool/tool-like.js";
import { Session } from "../../core/classes/runtime.js";
import { ClassWithMarker } from "../marker.class.js";

export class AgentRuntime {
  constructor(
    public userId?: string
  ) { }
}

export const AGENT_STATEGY_SYMBOL = Symbol.for('plugin.agentstrategy');
export abstract class AgentStrategy extends ToolLike<AgentInvokeMessage> {
  static [AGENT_STATEGY_SYMBOL] = true;
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

export type AgentStrategyClassType = ClassWithMarker<AgentStrategy, typeof AGENT_STATEGY_SYMBOL>;
export function isAgentStrategyClass(cls: any): cls is AgentStrategyClassType {
  return Boolean(cls?.[AGENT_STATEGY_SYMBOL]);
}
