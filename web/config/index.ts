export const LOCALE_COOKIE_NAME = 'locale';
export const DISABLE_UPLOAD_AVATAR = process.env.NEXT_PUBLIC_DISABLE_UPLOAD_AVATAR === 'true';
export const ALLOW_FILE_EXTENSIONS = ['png', 'jpg', 'jpeg', 'webp', 'gif']

export const API_PREFIX = process.env.NEXT_PUBLIC_API_PREFIX || 'http://localhost:3001/api';
export const PUBLIC_API_PREFIX = process.env.NEXT_PUBLIC_PUBLIC_API_PREFIX || 'http://localhost:3001/open/api';
export const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
export const ASSETS_URL = process.env.NEXT_PUBLIC_ASSETS_URL || `${BASE_URL}/assets`;

export const NODE_MAX_PARALLEL_LIMIT = 10;
export const NODE_MAX_TOOL_LIMIT = 10;
export const NODE_MAX_ITERATION_LIMIT = 10;

