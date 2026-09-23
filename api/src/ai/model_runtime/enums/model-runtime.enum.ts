export enum ModelType {
  llm = 'llm',
  text_embedding = 'text-embedding',
  rerank = 'rerank',
  speech2text = 'speech2text', // speech to text
  moderation = 'moderation',
  tts = 'tts', // text to speech 
}

export enum FetchFrom {
  predefined_model = 'predefined-model',
  customizable_model = 'customizable-model',
}

export enum ModelFeature {
  tool_call = 'tool-call',
  multi_tool_call = 'multi-tool-call',
  agent_thought = 'agent-thought',
  vision = 'vision',
  stream_tool_call = 'stream-tool-call',
  document = 'document',
  video = 'video',
  audio = 'audio',
  image = 'image',
  structured_output = 'structured-output',
}

export enum ModelPropertyKey {
  mode = 'mode',
  content_size = 'content_size',
  max_chunks = 'max_chunks',
  file_upload_limit = 'file_upload_limit',
  supported_file_extensions = 'supported_file_extensions',
  max_characters_per_chunk = 'max_characters_per_chunk',
  default_voice = 'default_voice',
  voices = 'voices',
  word_limit = 'word_limit',
  audio_type = 'audio_type',
  max_workers = 'max_workers',
}

export type ConfigureMethod = FetchFrom;

