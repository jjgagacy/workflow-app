import { IsNotEmpty } from 'class-validator';
import { BaseRoleDto } from './base-role.dto';

export class UpdateRoleDto extends BaseRoleDto {
  id?: number;
  @IsNotEmpty({ message: 'validation.NOT_EMPTY' })
  name: string;
  updatedAt?: Date;
  @IsNotEmpty({ message: 'validation.NOT_EMPTY' })
  updatedBy: string;
}
