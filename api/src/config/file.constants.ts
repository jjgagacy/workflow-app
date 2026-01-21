export const FILE_CONSTANTS = {
  MAX_FILENAME_LENGTH: 200,
  INVALID_CHARS: ['/', '\\', ':', '*', '?', '"', '<', '>', '|'] as const,
} as const;

export const IMAGE_EXTENSIONS = new Set([
  'jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg', 'ico', 'tiff'
]);

export const VIDEO_EXTENSIONS = new Set([
  'mp4', 'avi', 'mov', 'wmv', 'flv', 'mkv', 'webm'
]);

export const AUDIO_EXTENSIONS = new Set([
  'mp3', 'wav', 'ogg', 'm4a', 'flac', 'aac'
]);

export const DOCUMENT_EXTENSIONS = new Set([
  'txt', 'pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx',
  'md', 'csv', 'json', 'xml', 'html', 'htm', 'rtf'
]);


