import { IsNotEmpty } from 'class-validator';
import { BaseRoleDto } from './base-role.dto';

export class UpdateRoleDto extends BaseRoleDto {
  id?: number;
  @IsNotEmpty({ message: "名称不能为空" })
  name: string;
  updatedAt?: Date;
  @IsNotEmpty({ message: "更新人不能为空" })
  updatedBy: string;
}
