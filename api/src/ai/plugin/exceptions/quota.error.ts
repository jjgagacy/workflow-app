import { I18nTranslations } from "@/generated/i18n.generated";
import { UnprocessableEntityException } from "@nestjs/common";
import { I18nService } from "nestjs-i18n";

export class QuotaUsedOrLimitNullError extends UnprocessableEntityException {
  constructor(message: string) {
    super(message);
    this.name = 'QuotaUsedOrLimitNullError';
  }

  static create(i18n: I18nService<I18nTranslations>): QuotaUsedOrLimitNullError {
    return new QuotaUsedOrLimitNullError(i18n.t('model.QUOTA_USED_OR_LIMIT_NULL'));
  }
}

export class QuotaTypeUnavailableError extends UnprocessableEntityException {
  constructor(message: string) {
    super(message);
    this.name = 'QuotaTypeUnavailableError';
  }

  static create(i18n: I18nService<I18nTranslations>): QuotaTypeUnavailableError {
    return new QuotaTypeUnavailableError(i18n.t('model.QUOTA_TYPE_UNAVAILABLE'));
  }
}
