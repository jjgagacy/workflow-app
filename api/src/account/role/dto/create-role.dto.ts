import { IsNotEmpty } from 'class-validator';
import { BaseRoleDto } from './base-role.dto';

export class CreateRoleDto extends BaseRoleDto {
  @IsNotEmpty({ message: 'validation.NOT_EMPTY' })
  name: string;

  createdAt?: Date;

  @IsNotEmpty({ message: 'validation.NOT_EMPTY' })
  createdBy: string;
}
