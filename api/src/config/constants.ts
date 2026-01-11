import { TokenType } from "@/service/libs/token-manager.service";

export const JWT_CONSTANTS = {
  secret: 'secretKey-my-admin-#&$%*(@.!2313456809',
  expiresIn: '24h' // Token expiration time
};
export const PASSWORD_SALT = '$2b$10$/mPO8XPZKGXUegJVXusa9.';
export const BCRYPT_SALT_ROUNDS = 12;
export const PAGE_LIMIT_MAX = 1000;
// Token default times
export const DEFAULT_TOKEN_TYPE_EXPIRY: Record<TokenType, number> = {
  'change_email': Number(process.env.CHANGE_EMAIL_TOKEN_EXPIRY_MINUTES || 5), // minutes
  'account_deletion': Number(process.env.ACCOUNT_DELETION_TOKEN_EXPIRY_MINUTES || 60), // minutes
  'email_verification': Number(process.env.EMAIL_CODE_LOGIN_EXPIRY_MINUTES || 60), // minutes
  'reset_password': Number(process.env.RESET_PASSWORD_TOKEN_EXPIRY_MINUTES || 5), // minutes
};
export const DEFAULT_LANG = 'en_US';
export const HIDDEN_VALUE = '[__HIDDEN__]';
export const UNKNOWN_ALUE = '[__UNKNOWN__]';
export const UUID_NIL = '00000000-0000-0000-0000-000000000000';

