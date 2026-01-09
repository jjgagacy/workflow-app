import { EmailCheckDto } from "@/service/libs/validators/email-check.dto";
import { ArgumentMetadata, Injectable, PipeTransform } from "@nestjs/common";
import { plainToInstance } from "class-transformer";
import { I18nService } from "nestjs-i18n";
import { throwIfDtoValidateFail } from "../utils/validation";

@Injectable()
export class EmailValidationPipe implements PipeTransform {

  constructor(private readonly i18n: I18nService) { }

  async transform(value: any, metadata: ArgumentMetadata) {
    const obj = { email: value };
    const validateObj = plainToInstance(EmailCheckDto, obj);
    const errors = await this.i18n.validate(validateObj);

    throwIfDtoValidateFail(errors);

    return value.trim().toLowerCase();
  }
}
