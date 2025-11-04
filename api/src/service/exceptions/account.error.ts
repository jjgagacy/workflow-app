import { I18nTranslations } from "@/generated/i18n.generated";
import { ForbiddenException } from "@nestjs/common";
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
