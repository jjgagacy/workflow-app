import { IsNotEmpty } from "class-validator";

export class CreateTenantDto {
  @IsNotEmpty({ message: 'validation.NOT_EMPTY' })
  name: string;
  @IsNotEmpty({ message: 'validation.NOT_EMPTY' })
  createdBy: string;
}
