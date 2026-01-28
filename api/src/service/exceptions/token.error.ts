import { I18nTranslations } from "@/generated/i18n.generated";
import { ForbiddenException } from "@nestjs/common";
import { I18nService } from "nestjs-i18n";

export class InvalidTokenError extends ForbiddenException {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidTokenError';
  }

  static create(i18n: I18nService<I18nTranslations>): InvalidTokenError {
    return new InvalidTokenError(i18n.t('auth.INVALID_TOKEN'));
  }
}

export class InvalidEmailError extends ForbiddenException {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidEmailError';
  }

  static create(i18n: I18nService<I18nTranslations>): InvalidEmailError {
    return new InvalidEmailError(i18n.t('auth.INVALID_EMAIL'));
  }
}


export class VerifyCodeError extends ForbiddenException {
  constructor(message: string) {
    super(message);
    this.name = 'VerifyCodeError';
  }

  static create(i18n: I18nService<I18nTranslations>): VerifyCodeError {
    return new VerifyCodeError(i18n.t('auth.VERIFY_CODE_ERROR'));
  }
}
