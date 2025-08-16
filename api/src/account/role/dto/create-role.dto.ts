import { IsNotEmpty } from 'class-validator';
import { BaseRoleDto } from './base-role.dto';

export class CreateRoleDto extends BaseRoleDto {
  @IsNotEmpty({ message: "角色名称不能为空" })
  name: string;

  createdAt?: Date;
  
  @IsNotEmpty({ message: "创建人不能为空" })
  createdBy: string;
}
