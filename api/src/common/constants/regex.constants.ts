export const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

export const EMAIL_REGEX_STRICT =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

export const USERNAME_LENGTH_REGEX = /^[\u4e00-\u9fa5a-zA-Z0-9_]{2,30}$/;

export const USERNAME_REGEX = /^[\u4e00-\u9fa5a-zA-Z0-9_]+$/;

export const CHINESE_REGEX = /[\u4e00-\u9fa5a]/;
