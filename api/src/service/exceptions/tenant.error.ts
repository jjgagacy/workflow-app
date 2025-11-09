import { I18nTranslations } from "@/generated/i18n.generated";
import { NotFoundException } from "@nestjs/common";
import { I18nService } from "nestjs-i18n";

export class TenantNotFoundError extends NotFoundException {
    constructor(message: string) {
        super(message);
        this.name = 'TenantNotFoundError';
    }

    static create(i18n: I18nService<I18nTranslations>): TenantNotFoundError {
        return new TenantNotFoundError(i18n.t('tenant.TENANT_NOT_FOUND'));
    }
}