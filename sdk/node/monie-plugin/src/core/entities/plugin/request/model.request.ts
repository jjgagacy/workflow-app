import { ModelType } from "../../enums/model.enum";
import { PluginInvokeType } from "../../enums/plugin.type";
import { PromptMessage, PromptMessageHelper, PromptMessageTool } from "../message/message";
import { ModelActions, PluginAccessRequest } from "./request";


export class PluginAccessModelRequest extends PluginAccessRequest {
  provider: string;
  model: string;
  modelType: ModelType;
  credentials: Record<string, any>;

  constructor(data: Partial<PluginAccessModelRequest> = {}) {
    super(data);
    this.provider = data.provider || '';
    this.model = data.model || '';
    this.modelType = data.modelType || ModelType.LLM;
    this.credentials = data.credentials || {};
  }
}

export class ModelInvokeLLMRequest extends PluginAccessModelRequest {
  override action: ModelActions = ModelActions.InvokeLLM;

  promptMessages: PromptMessage[] = [];
  modelParameters: Record<string, any> = {};
  stop?: string[];
  tools?: PromptMessageTool[];
  stream: boolean = true;

  constructor(data?: Partial<ModelInvokeLLMRequest>) {
    super(data);
    if (data) {
      Object.assign(this, data);

      if (data.promptMessages) {
        this.promptMessages = PromptMessageHelper.convertPromptMessages(data.promptMessages);
      }
    }
  }
}

export class ModelGetLLMNumTokensRequest extends PluginAccessModelRequest {
  override action: ModelActions = ModelActions.GetLLMNumTokens;

  promptMessages: PromptMessage[] = [];
  tools: PromptMessageTool[] = [];

  constructor(data?: Partial<ModelGetLLMNumTokensRequest>) {
    super(data);
    if (data) {
      Object.assign(this, data);

      if (data.promptMessages) {
        this.promptMessages = PromptMessageHelper.convertPromptMessages(data.promptMessages);
      }
    }
  }
}

export class ModelInvokeTextEmbeddingRequest extends PluginAccessModelRequest {
  override action: ModelActions = ModelActions.InvokeTextEmbedding;
  texts: string[] = [];

  constructor(data: Partial<ModelInvokeTextEmbeddingRequest>) {
    super(data);
    this.texts = data.texts || [];
  }
}

export class ModelGetTextEmbeddingNumTokensRequest extends PluginAccessModelRequest {
  override action: ModelActions = ModelActions.GetTextEmbeddingNumTokens;
  texts: string[] = [];

  constructor(data: Partial<ModelGetTextEmbeddingNumTokensRequest>) {
    super(data);
    this.texts = data.texts || [];
  }
}

export class ModelInvokeRerankRequest extends PluginAccessModelRequest {
  override action: ModelActions = ModelActions.InvokeRerank;
  query: string;
  docs: string[];
  scoreThreshold?: number | undefined;
  topN?: number;

  constructor(data?: Partial<ModelInvokeRerankRequest>) {
    super(data);
    Object.assign(this, data);
    this.query = data?.query || '';
    this.docs = data?.docs || [];
  }
}

export class ModelInvokeTTSRequest extends PluginAccessModelRequest {
  override action: ModelActions = ModelActions.InvokeTTS;
  contentText: string;
  voice: string;
  tenantId: string;

  constructor(data: Partial<ModelInvokeTTSRequest>) {
    super(data);
    this.contentText = data.contentText || '';
    this.voice = data.voice || '';
    this.tenantId = data.tenantId || '';
  }
}

export class ModelGetTTSVoicesRequest extends PluginAccessModelRequest {
  override action: ModelActions = ModelActions.GetTTSVoices;
  language?: string;

  constructor(data: Partial<ModelGetTTSVoicesRequest>) {
    super(data);
    Object.assign(this, data);
  }
}

export class ModelInvokeModerationRequest extends PluginAccessModelRequest {
  override action: ModelActions = ModelActions.InvokeModeration;
  text: string;

  constructor(data: Partial<ModelInvokeModerationRequest>) {
    super(data);
    this.text = data.text || '';
  }
}

export class ModelInvokeSpeech2TextRequest extends PluginAccessModelRequest {
  override action: ModelActions = ModelActions.InvokeSpeech2Text;
  file: string;

  constructor(data: Partial<ModelInvokeSpeech2TextRequest>) {
    super(data);
    this.file = data.file || '';
  }
}

export class ModelValidateProviderCredentialsRequest extends PluginAccessModelRequest {
  override type: PluginInvokeType = PluginInvokeType.Model;
  override action: ModelActions = ModelActions.ValidateProviderCredentials;

  provider: string;
  credentials: Record<string, any>;

  constructor(data: Partial<ModelValidateProviderCredentialsRequest>) {
    super(data);
    this.provider = data.provider || '';
    this.credentials = data.credentials || {};
  }
}

export class ModelValidateModelCredentialsRequest extends PluginAccessModelRequest {
  override type: PluginInvokeType = PluginInvokeType.Model;
  override action: ModelActions = ModelActions.ValidateProviderCredentials;

  provider: string;
  modelType: ModelType;
  model: string;
  credentials: Record<string, any>;

  constructor(data: Partial<ModelValidateModelCredentialsRequest>) {
    super(data);
    this.provider = data.provider || '';
    this.modelType = data.modelType || ModelType.LLM;
    this.model = data.model || '';
    this.credentials = data.credentials || {};
  }
}

export class ModelGetAIModelSchemasRequest extends PluginAccessModelRequest {
  override action: ModelActions = ModelActions.GetAIModelSchemas;
}
