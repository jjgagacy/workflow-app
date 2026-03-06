import { IsNotEmpty } from "class-validator";
import { BasePermDto } from "./base.dto";

export class UpdatePermDto extends BasePermDto {
  @IsNotEmpty({ message: 'validation.NOT_EMPTY' })
  name!: string;
}
