import { IsNotEmpty } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';

export class BaseModulePermDto {
  @IsNotEmpty({ message: "validation.not_empty" })
  key: string;
  restrictLevel?: number;
}
