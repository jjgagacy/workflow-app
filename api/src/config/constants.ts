import { TokenType } from "@/service/libs/token-manager.service";

export const JWT_CONSTANTS = {
  secret: 'secretKey-my-admin-#&$%*(@.!2313456809',
  expiresIn: '24h' // Token expiration time
};
export const PASSWORD_SALT = '$2b$10$/mPO8XPZKGXUegJVXusa9.';
export const PAGE_LIMIT_MAX = 1000;
export const DEFAULT_TOKEN_TYPE_EXPIRY: Record<TokenType, number> = {
  'change_email': 5, // minutes
  'account_deletion': 60, // minutes
  'email_verification': 60, // minutes
  'reset_password': 5, // minutes
};
