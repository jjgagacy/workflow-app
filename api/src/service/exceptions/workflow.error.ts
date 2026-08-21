import { I18nTranslations } from "@/generated/i18n.generated";
import { ForbiddenException } from "@nestjs/common";
import { I18nService } from "nestjs-i18n";

export class WorkflowNotFoundError extends ForbiddenException {
  constructor(message: string) {
    super(message);
    this.name = 'WorkflowNotFoundError';
  }

  static create(i18n: I18nService<I18nTranslations>): WorkflowNotFoundError {
    return new WorkflowNotFoundError(i18n.t('app.WORKFLOW_NOT_FOUND'));
  }
}