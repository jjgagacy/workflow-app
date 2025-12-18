import { Tool } from "@/interfaces/tool/tool";
import { PluginInvokeType } from "../../enums/plugin.type";

export enum PromptMessageRole {
  USER = 'user',
  ASSISTANT = 'assistant',
  SYSTEM = 'system',
  TOOL = 'tool'
}

export enum CredentialType {
  API_KEY = 'api_key',
  OAUTH = 'oauth',
  BEARER_TOKEN = 'bearer_token'
}

export enum AgentActions {
  InvokeAgentStrategy = 'invoke_agent_strategy'
}

export enum ToolActions {
  ValidateCredentials = 'validate_tool_credentials',
  InvokeTool = 'invoke_tool',
  GetToolRuntimeParameters = 'get_tool_runtime_parameters'
}

export enum ModelActions {
  ValidateProviderCredentials = 'validate_provider_credentials',
  ValidateModelCredentials = 'validate_model_credentials',
  InvokeLLM = 'invoke_llm',
  GetLLMNumTokens = 'get_llm_num_tokens',
  InvokeTextEmbedding = 'invoke_text_embedding',
  GetTextEmbeddingNumTokens = 'get_text_embedding_num_tokens',
  InvokeRerank = 'invoke_rerank',
  InvokeTTS = 'invoke_tts',
  GetTTSVoices = 'get_tts_model_voices',
  InvokeSpeech2Text = 'invoke_speech2text',
  InvokeModeration = 'invoke_moderation',
  GetAIModelSchemas = 'get_ai_model_schemas'
}

export enum EndpointActions {
  InvokeEndpoint = 'invoke_endpoint'
}

export enum OAuthActions {
  GetAuthorizationUrl = 'get_authorization_url',
  GetCredentials = 'get_credentials',
  RefreshCredentials = 'refresh_credentials'
}

export enum DynamicParameterActions {
  FetchParameterOptions = 'fetch_parameter_options'
}

export type PluginAccessAction =
  | AgentActions
  | ToolActions
  | ModelActions
  | EndpointActions
  | DynamicParameterActions;

export class PluginAccessRequest {
  type: PluginInvokeType;
  userId: string;
  action: PluginAccessAction;

  constructor(data: Partial<PluginAccessRequest>) {
    this.type = data.type || PluginInvokeType.Tool;
    this.userId = data.userId || '';
    this.action = data.action || ToolActions.InvokeTool;
  }
}
