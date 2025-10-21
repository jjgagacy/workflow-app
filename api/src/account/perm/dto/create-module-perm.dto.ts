import { IsNotEmpty } from 'class-validator';
import { BaseModulePermDto } from './base-module-perm.dto';

export class CreateModulePermDto extends BaseModulePermDto {
  @IsNotEmpty({ message: 'validation.NOT_EMPTY' })
  name: string;
  @IsNotEmpty({ message: 'validation.NOT_EMPTY' })
  moduleId: number;
}
