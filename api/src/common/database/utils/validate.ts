import { DatabaseGraphQLException } from "@/common/exceptions";
import { I18nTranslations } from "@/generated/i18n.generated";
import { I18nService } from "nestjs-i18n";

export function checkEntityCreatedId(entity: { id: any }, i18n: I18nService<I18nTranslations>) {
  if (!entity.id) {
    throw new DatabaseGraphQLException(i18n.t('system.CREATE_FAILED_ID_INVALID'));
  }
}
