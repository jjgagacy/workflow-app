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

export const IMAGE_MIME_TYPES: Record<string, string> = {
  // JPEG 格式
  'jpg': 'image/jpeg',
  'jpeg': 'image/jpeg',

  // PNG 格式
  'png': 'image/png',

  // GIF 格式
  'gif': 'image/gif',

  // WebP 格式
  'webp': 'image/webp',

  // SVG 格式
  'svg': 'image/svg+xml',
  'svgz': 'image/svg+xml',

  // BMP 格式
  'bmp': 'image/bmp',

  // ICO 格式（图标）
  'ico': 'image/x-icon',

  // TIFF 格式
  'tiff': 'image/tiff',
  'tif': 'image/tiff',

  // 其他格式
  'heic': 'image/heic',
  'heif': 'image/heif',
  'avif': 'image/avif',

  // 未知图片格式
  'default': 'image/*',
};

