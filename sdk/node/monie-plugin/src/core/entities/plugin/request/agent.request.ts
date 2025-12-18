import { PluginInvokeType } from "../../enums/plugin.type";
import { PluginAccessRequest, PluginAccessAction, AgentActions } from "./request";


export class AgentInvokeRequest extends PluginAccessRequest {
  override type: PluginInvokeType = PluginInvokeType.Agent;
  override action: PluginAccessAction = AgentActions.InvokeAgentStrategy;

  agentStrategyProvider: string;
  agentStrategy: string;
  agentStrategyParameters: Record<string, any>;

  constructor(data: Partial<AgentInvokeRequest>) {
    super(data);
    this.agentStrategyProvider = data.agentStrategyProvider || '';
    this.agentStrategy = data.agentStrategy || '';
    this.agentStrategyParameters = data.agentStrategyParameters || {};
  }
}
