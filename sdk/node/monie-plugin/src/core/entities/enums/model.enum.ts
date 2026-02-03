export enum ModelType {
  LLM = 'llm',
  TEXT_EMBEDDING = 'text-embedding',
  RERANK = 'rerank',
  SPEECH2TEXT = 'speech2text', // speech to text
  MODERATION = 'moderation',
  TTS = 'tts', // text to speech 
}

export enum FetchFrom {
  PREDEFINED_MODEL = 'predefined-model',
  CUSTOMIZABLE_MODEL = 'customizable-model',
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

export type ConfigurateMethod = FetchFrom;

export enum ModelFeature {
  TOOL_CALL = 'tool-call',
  MULTI_TOOL_CALL = 'multi-tool-call',
  AGENT_THROUGHT = 'agent-through',
  VESION = 'vision',
  STREAM_TOOL_CALL = 'stream-tool-call',
  DOCUMENT = 'document',
  VIDEO = 'video',
  AUDIO = 'audio',
  STRUCTURED_OUTPUT = 'structure-output',
}
