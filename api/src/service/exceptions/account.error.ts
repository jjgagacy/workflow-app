import { I18nTranslations } from "@/generated/i18n.generated";
import { BadRequestException, ForbiddenException, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { I18nService } from "nestjs-i18n";

export class EmailInFreezeError extends ForbiddenException {
  constructor(message: string) {
    super(message);
    this.name = 'EmailInFreezeError';
  }

  static create(i18n: I18nService<I18nTranslations>): EmailInFreezeError {
    return new EmailInFreezeError(i18n.t('account.EMAIL_IN_FREEZE'));
  }
}

export class EmailExistingError extends BadRequestException {
  constructor(message: string) {
    super(message);
    this.name = 'EmailExistingError';
  }

  static create(i18n: I18nService<I18nTranslations>): EmailExistingError {
    return new EmailExistingError(i18n.t('account.EMAIL_EXIST'));
  }
}

export class AccountNotFoundError extends NotFoundException {
  constructor(message: string) {
    super(message);
    this.name = 'AccountNotFound';
  }

  static create(i18n: I18nService<I18nTranslations>): AccountNotFoundError {
    return new AccountNotFoundError(i18n.t('account.ACCOUNT_NOT_EXIST'));
  }
}

export class EmailChangeErrorRateLimit extends BadRequestException {
  constructor(message: string) {
    super(message);
    this.name = 'EmailChangeErrorRateLimit';
  }

  static create(i18n: I18nService<I18nTranslations>): EmailChangeErrorRateLimit {
    return new EmailChangeErrorRateLimit(i18n.t('auth.EMAIL_CHANGE_ERROR_RATE_LIMIT'));
  }
}

export class LoginErrorRateLimit extends BadRequestException {
  constructor(message: string) {
    super(message);
    this.name = 'LoginErrorRateLimit';
  }

  static create(i18n: I18nService<I18nTranslations>): LoginErrorRateLimit {
    return new LoginErrorRateLimit(i18n.t('auth.LOGIN_ERROR_RATE_LIMIT'));
  }
}

export class ForgetPasswordErrorRateLimit extends BadRequestException {
  constructor(message: string) {
    super(message);
    this.name = 'ForgetPasswordErrorRateLimit';
  }

  static create(i18n: I18nService<I18nTranslations>): ForgetPasswordErrorRateLimit {
    return new ForgetPasswordErrorRateLimit(i18n.t('auth.FORGET_PASSWORD_ERROR_RATE_LIMIT'));
  }
}

export class PasswordMismatchError extends BadRequestException {
  constructor(message: string) {
    super(message);
    this.name = "PasswordMismatchError";
  }

  static create(i18n: I18nService<I18nTranslations>): PasswordMismatchError {
    return new PasswordMismatchError(i18n.t('auth.PASSWORD_MISMATCH'));
  }
}

export class AccountNotInitializedError extends UnauthorizedException {
  constructor(message: string) {
    super(message);
    this.name = 'AccountNotInitializedError';
  }

  static create(i18n: I18nService<I18nTranslations>): AccountNotInitializedError {
    return new AccountNotInitializedError(i18n.t('account.ACCOUNT_NOT_INITIALIZED'));
  }
}

export class AccountInPendingError extends UnauthorizedException {
  constructor(message: string) {
    super(message);
    this.name = 'AccountInPendingError';
  }

  static create(i18n: I18nService<I18nTranslations>): AccountInPendingError {
    return new AccountInPendingError(i18n.t('auth.INVALID_ACCOUNT'));
  }
}

export class AccountBannedError extends UnauthorizedException {
  constructor(message: string) {
    super(message);
    this.name = 'AccountBannedError';
  }

  static create(i18n: I18nService<I18nTranslations>): AccountBannedError {
    return new AccountBannedError(i18n.t('account.ACCOUNT_BANNED'));
  }
}

export class AccountAlreadyInTenantError extends BadRequestException {
  constructor(message: string) {
    super(message);
    this.name = 'AccountAlreadyInTenantError';
  }

  static create(i18n: I18nService<I18nTranslations>): AccountAlreadyInTenantError {
    return new AccountAlreadyInTenantError(i18n.t('account.ACCOUNT_ALREADY_IN_TENANT'));
  }
}
