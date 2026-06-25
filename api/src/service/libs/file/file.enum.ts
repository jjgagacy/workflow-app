export enum FileType {
  IMAGE = 'image',
  VIDEO = 'video',
  AUDIO = 'audio',
  DOCUMENT = 'document',
  OTHER = 'other',
}

export enum FileTransferMethod {
  REMOTE_URL = 'remote_url',
  LOCAL_FILE = 'local_file',
  // TOOL_FILE = 'tool_file',
}

export enum FileAttribute {
  TYPE = 'type',
  NAME = 'name',
  EXTENSION = 'extension',
  SIZE = 'size',
  MIME_TYPE = 'mime_type',
  URL = 'url',
  TRANSFER_METHOD = 'transfer_method',
  RELATE_ID = 'related_id',
}
