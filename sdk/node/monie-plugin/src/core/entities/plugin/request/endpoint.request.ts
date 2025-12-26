import { PluginInvokeType } from "../../enums/plugin.type";
import { EndpointActions, PluginAccessAction, PluginAccessRequest } from "./request";

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
