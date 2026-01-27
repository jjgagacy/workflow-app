import { EmailCheckDto } from "@/service/libs/validators/email-check.dto";
import { ArgumentMetadata, Injectable, PipeTransform } from "@nestjs/common";
import { I18nService } from "nestjs-i18n";
import { validateDto } from "../utils/validation";

@Injectable()
export class EmailValidationPipe implements PipeTransform {

  constructor(private readonly i18n: I18nService) { }

  async transform(value: any, metadata: ArgumentMetadata) {
    const obj = { email: value };
    await validateDto(EmailCheckDto, obj, this.i18n);
    return value.trim().toLowerCase();
  }
}
