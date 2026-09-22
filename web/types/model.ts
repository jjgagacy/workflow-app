
export type I18nObject<T = string> = {
  en_US: T;
  zh_Hans: T;
  [key: string]: T;
}

export enum ModelType {
  llm = 'llm',
  textEmbedding = 'text-embedding',
  rerank = 'rerank',
  speech2text = 'speech2text',
  moderation = 'moderation',
  tts = 'tts',
}

export const MODEL_TYPE_TEXT = {
  [ModelType.llm]: 'LLM',
  [ModelType.textEmbedding]: 'Text Embedding',
  [ModelType.rerank]: 'Rerank',
  [ModelType.speech2text]: 'Speech to Text',
  [ModelType.moderation]: 'Moderation',
  [ModelType.tts]: 'Text to Speech',
}

export enum ModelFeature {
  toolCall = 'tool-call',
  multiToolCall = 'multi-tool-call',
  agentThought = 'agent-thought',
  streamToolCall = 'stream-tool-call',
  vision = 'vision',
  video = 'video',
  document = 'document',
  audio = 'audio',
  StructuredOutput = 'structured-output',
}

export enum ModelFeatureText {
  toolCall = 'Tool Call',
  multiToolCall = 'Multi Tool Call',
  agentThought = 'Agent Thought',
  vision = 'Vision',
  video = 'Video',
  document = 'Document',
  audio = 'Audio',
}

export enum ModelStatus {
  active = 'active',
  noConfigure = 'no-configure',
  quotaExceeded = 'quota-exceeded',
  noPermission = 'no-permission',
  disabled = 'disabled',
}

export enum FetchFrom {
  predefinedModel = 'predefined-model',
  customizableModel = 'customizable-model',
}

export enum ModelPropertyKey {
  MODE = 'mode',
  CONTENT_SIZE = 'content_size',
  MAC_CHUNKS = 'max_chunks',
  FILE_UPLOAD_LIMIT = 'file_upload_limit',
  SUPPORTED_FILE_EXTENSIONS = 'supported_file_extensions',
  MAX_CHARACTERS_PER_CHUNK = 'max_characters_per_chunk',
  DEFAULT_VOICE = 'default_voice',
  VOICES = 'voices',
  WORD_LIMIT = 'word_limit',
  AUDIO_TYPE = 'audio_type',
  MAX_WORKERS = 'max_workers',
}

export type ModelWithStatus = {
  model: string;
  label: I18nObject;
  modelType: ModelType;
  features: ModelFeature[];
  fetchFrom: FetchFrom;
  modelProperties: Record<string, string | number>;
  deprecated: boolean;
  status: ModelStatus;
}

export interface ModelProviderModels {
  tenantId: string;
  providerName: string;
  label: I18nObject;
  description?: I18nObject;
  icon?: I18nObject;
  iconDark?: I18nObject;
  iconSmall?: I18nObject;
  iconSmallDark?: I18nObject;
  status: string;
  models: ModelWithStatus[];
}

export type SelectModel = {
  provider: string;
  model: string;
}

export const toSelectModel = (models: ModelProviderModels[], provider: string, model: string): SelectModel => {
  const foundModel = models.find(m => m.providerName === provider)?.models.find(m => m.model === model);
  return {
    provider,
    model: foundModel?.model || model,
  };
};