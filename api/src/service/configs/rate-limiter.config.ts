import { EmailRateLimitOptions, EmailRateLimitType } from "../libs/rate-limiter/email-rate-limiter.service";
import { LoginRateLimitOptions, LoginRateLimitType } from "../libs/rate-limiter/login-rate-limiter.service";


export type EMAIL_RATE_CONFIG_KEYS = 'reset_password' | 'change_email' | 'email_code_login' | 'email_code_account_deletion' | 'confirm_email' | 'invite_member';
export type LOGIN_RATE_CONFIG_KEYS = 'password_login' | 'change_password';

export const EMAIL_RATE_LIMITER_CONFIGS: Record<EMAIL_RATE_CONFIG_KEYS, EmailRateLimitOptions> = {
  'reset_password': {
    type: EmailRateLimitType.RESET_PASSWORD,
    maxAttempts: 5,
    timeWindow: 60, // seconds
  },
  'change_email': {
    type: EmailRateLimitType.CHANGE_EMAIL,
    maxAttempts: 5,
    timeWindow: 60,
  },
  'confirm_email': {
    type: EmailRateLimitType.CONFIRM_EMAIL,
    maxAttempts: 5,
    timeWindow: 60,
  },
  'email_code_login': {
    type: EmailRateLimitType.EMAIL_CODE_LOGIN,
    maxAttempts: 5,
    timeWindow: 60,
  },
  'email_code_account_deletion': {
    type: EmailRateLimitType.EMAIL_CODE_ACCOUNT_DELETION,
    maxAttempts: 3,
    timeWindow: 60,
  },
  'invite_member': {
    type: EmailRateLimitType.INVITE_MEMBER,
    maxAttempts: 3,
    timeWindow: 60,
  }
};

export const LOGIN_RATE_LIMITER_CONFIGS: Record<LOGIN_RATE_CONFIG_KEYS, LoginRateLimitOptions> = {
  'password_login': {
    type: LoginRateLimitType.PASSWORD_LOGIN,
    maxAttempts: 5,
    timeWindow: 300,
  },
  'change_password': {
    type: LoginRateLimitType.CHANGE_PASSWORD,
    maxAttempts: 5,
    timeWindow: 300,
  },
};
