export const LOCALE_COOKIE_NAME = 'locale';
export const DISABLE_UPLOAD_AVATAR = process.env.NEXT_PUBLIC_DISABLE_UPLOAD_AVATAR === 'true';
export const ALLOW_FILE_EXTENSIONS = ['png', 'jpg', 'jpeg', 'webp', 'gif']

export const API_PREFIX = process.env.NEXT_PUBLIC_API_PREFIX || 'http://localhost:3001/api';
export const PUBLIC_API_PREFIX = process.env.NEXT_PUBLIC_PUBLIC_API_PREFIX || 'http://localhost:3001/open/api';
