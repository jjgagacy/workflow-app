import { I18nTranslations } from "@/generated/i18n.generated";
import { BadRequestException, UnauthorizedException } from "@nestjs/common";
import { I18nService } from "nestjs-i18n";

export class AccountDeletionRateLimitError extends BadRequestException {
  constructor(message: string) {
    super(message);
    this.name = 'AccountDeletionRateLimitError';
  }

  static create(i18n: I18nService<I18nTranslations>, timeWindow?: number): AccountDeletionRateLimitError {
    return new AccountDeletionRateLimitError(i18n.t('auth.ACCOUNT_DELETION_RATE_LIMIT_EXCEEDED', { args: { timeWindow } }))
  }
}

export class AccountChangeEmailRateLimitError extends BadRequestException {
  constructor(message: string) {
    super(message);
    this.name = 'AccountChangeEmailRateLimitError';
  }

  static create(i18n: I18nService<I18nTranslations>, timeWindow?: number): AccountChangeEmailRateLimitError {
    return new AccountChangeEmailRateLimitError(i18n.t('auth.EMAIL_CHANGE_RATE_LIMIT_EXCEEDED', { args: { timeWindow } }))
  }
}

export class EmailCodeLoginRateLimitError extends BadRequestException {
  constructor(message: string) {
    super(message);
    this.name = 'EmailCodeLoginRateLimitError';
  }

  static create(i18n: I18nService<I18nTranslations>, timeWindow?: number): EmailCodeLoginRateLimitError {
    return new EmailCodeLoginRateLimitError(i18n.t('auth.EMAIL_LOGIN_RATE_LIMIT_EXCEEDED', { args: { timeWindow } }))
  }
}

export class EmailPasswordLoginRateLimitError extends BadRequestException {
  constructor(message: string) {
    super(message);
    this.name = 'EmailPasswordLoginRateLimitError';
  }

  static create(i18n: I18nService<I18nTranslations>, timeWindow?: number): EmailPasswordLoginRateLimitError {
    return new EmailPasswordLoginRateLimitError(i18n.t('auth.EMAIL_LOGIN_RATE_LIMIT_EXCEEDED', { args: { timeWindow } }))
  }
}

export class AccountResetPasswordRateLimitError extends BadRequestException {
  constructor(message: string) {
    super(message);
    this.name = 'AccountResetPasswordRateLimitError';
  }

  static create(i18n: I18nService<I18nTranslations>, timeWindow?: number): AccountResetPasswordRateLimitError {
    return new AccountResetPasswordRateLimitError(i18n.t('auth.PASSWORD_RESET_RATE_LIMIT_EXCEEDED', { args: { timeWindow } }))
  }
}

export class EmailPasswordLoginInvalidCredentialError extends UnauthorizedException {
  constructor(message: string) {
    super(message);
    this.name = 'EmailPasswordLoginInvalidCredentialError';
  }

  static create(i18n: I18nService<I18nTranslations>): EmailPasswordLoginInvalidCredentialError {
    return new EmailPasswordLoginInvalidCredentialError(i18n.t('auth.PASSWORD_INVALID'))
  }
}

export class InviteMemberRateLimitError extends BadRequestException {
  constructor(message: string) {
    super(message);
    this.name = 'InviteMemberRateLimitError';
  }

  static create(i18n: I18nService<I18nTranslations>, timeWindow?: number): InviteMemberRateLimitError {
    return new InviteMemberRateLimitError(i18n.t('auth.INVITE_MEMBER_RATE_LIMIT_EXCEEDED', { args: { timeWindow } }))
  }
}
