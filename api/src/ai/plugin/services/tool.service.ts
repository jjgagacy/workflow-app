import { Injectable } from "@nestjs/common";
import { BasePluginClient } from "../../../monie/classes/base-plugin-client";
import { CredentialType } from "@/ai/model_runtime/classes/plugin/oauth";
import { ToolInvokeMessage } from "../entities/tool.entities";
import { ToolProviderID } from "../entities/provider-id.entities";
import { catchError, map, Observable, throwError } from "rxjs";
import { handlePluginError, PluginInvokeError } from "../entities/plugin-error";

interface InvokeParams {
  tenantId: string;
  userId: string;
  toolProvider: string;
  pluginId: string;
  toolName: string;
  credentials: Record<string, any>;
  credentialType: CredentialType;
  toolParameters: Record<string, any>;
  conversationId?: string;
  appId?: string;
  messageId?: string;
}

@Injectable()
export class PluginToolService {
  constructor(
    private readonly baseClient: BasePluginClient
  ) { }

  invoke(params: InvokeParams): Observable<ToolInvokeMessage> {
    const toolProviderId = new ToolProviderID(params.toolProvider);

    return this.baseClient.streamRequest<ToolInvokeMessage>({
      method: 'POST',
      path: `plugin/${params.tenantId}/dispatch/tool/invoke`,
      data: {
        tenant_id: params.tenantId,
        user_id: params.userId,
        conversation_id: params.conversationId,
        app_id: params.appId,
        message_id: params.messageId,
        // plugin_id: params.pluginId,
        endpoint_id: "",
        context: {},
        data: {
          provider: toolProviderId.providerName,
          tool: params.toolName,
          credentials: params.credentials,
          credential_type: params.credentialType,
          tool_parameters: params.toolParameters
        }
      },
      headers: {
        'X-Plugin-ID': params.pluginId,
      }
    }).pipe(
      map((data) => {
        return new ToolInvokeMessage(
          data.type,
          data.message,
          data.meta
        );
      }),
      catchError((error) => {
        console.log('Error invoking plugin tool:', error);
        const errorMessage = handlePluginError(error);
        return throwError(() => new PluginInvokeError(errorMessage));
      })
    );
  }
}

