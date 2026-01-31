
import { ArgumentMetadata, BadRequestException, Injectable, PipeTransform } from "@nestjs/common";
import { I18nService } from "nestjs-i18n";

@Injectable()
export class RequiredStringPipe implements PipeTransform {
  constructor(private readonly i18n: I18nService) { }
  transform(value: any, metadata: ArgumentMetadata) {
    if (!value || typeof value !== 'string' || value.trim() === '') {
      throw new BadRequestException(this.i18n.t('validation.NOT_EMPTY', { args: { property: 'property' } }));
    }
    return value;
  }
}
