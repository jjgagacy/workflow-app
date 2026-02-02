import { PluginInvokeType } from "../../enums/plugin.type.js";
import { EndpointActions, PluginAccessAction, PluginAccessRequest } from "./request.js";

export class EndpointInvokeRequest extends PluginAccessRequest {
  type: PluginInvokeType = PluginInvokeType.Endpoint;
  action: PluginAccessAction = EndpointActions.InvokeEndpoint;

  rawHttpRequest: string;
  settings?: Record<string, any>;

  constructor(data: Partial<EndpointInvokeRequest>) {
    super(data);
    Object.assign(this, data);
    this.rawHttpRequest = data.rawHttpRequest || '';
  }
}
