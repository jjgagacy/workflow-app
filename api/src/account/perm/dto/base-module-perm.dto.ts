import { IsNotEmpty } from 'class-validator';

export class BaseModulePermDto {
  @IsNotEmpty({ message: "validation.not_empty" })
  key: string;
  restrictLevel?: number;
}
