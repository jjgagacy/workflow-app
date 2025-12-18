import { PluginInvokeType } from "../../enums/plugin.type";
import { PluginAccessRequest, PluginAccessAction, ToolActions, CredentialType } from "./request";


export class ToolInvokeRequest extends PluginAccessRequest {
  override type: PluginInvokeType = PluginInvokeType.Tool;
  override action: PluginAccessAction = ToolActions.InvokeTool;

  provider: string;
  tool: string;
  credentials: Record<string, any>;
  credentialType: CredentialType = CredentialType.API_KEY;
  toolParameters: Record<string, any>;

  constructor(data: Partial<ToolInvokeRequest>) {
    super(data);
    this.provider = data.provider || '';
    this.tool = data.tool || '';
    this.credentials = data.credentials || {};
    this.credentialType = data.credentialType || CredentialType.API_KEY;
    this.toolParameters = data.toolParameters || {};
  }
}

export class ToolValidateCredentialsRequest extends PluginAccessRequest {
  override type: PluginInvokeType = PluginInvokeType.Tool;
  override action: PluginAccessAction = ToolActions.ValidateCredentials;

  provider: string;
  credentials: Record<string, any>;

  constructor(data: Partial<ToolValidateCredentialsRequest>) {
    super(data);
    this.provider = data.provider || '';
    this.credentials = data.credentials || {};
  }
}

export class ToolGetRuntimeParametersRequest extends PluginAccessRequest {
  override type: PluginInvokeType = PluginInvokeType.Tool;
  override action: PluginAccessAction = ToolActions.GetToolRuntimeParameters;

  provider: string;
  tool: string;
  credentials: Record<string, any>;

  constructor(data: Partial<ToolGetRuntimeParametersRequest>) {
    super(data);
    this.provider = data.provider || '';
    this.tool = data.tool || '';
    this.credentials = data.credentials || {};
  }
}
