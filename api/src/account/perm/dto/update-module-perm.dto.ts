import { IsNotEmpty } from "class-validator";
import { BaseModulePermDto } from "./base-module-perm.dto";

export class UpdateModulePermDto extends BaseModulePermDto {
  @IsNotEmpty({ message: 'validation.NOT_EMPTY' })
  module: string;
  @IsNotEmpty({ message: 'validation.NOT_EMPTY' })
  name: string;
  @IsNotEmpty({ message: 'validation.NOT_EMPTY' })
  tenantId: string;
}
