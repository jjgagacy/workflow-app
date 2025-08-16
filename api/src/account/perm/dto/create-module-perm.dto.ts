import { IsNotEmpty } from 'class-validator';
import { BaseModulePermDto } from './base-module-perm.dto';

export class CreateModulePermDto extends BaseModulePermDto {
  @IsNotEmpty({ message: "模块权限名称不能为空" })
  name: string;
  @IsNotEmpty({ message: "模块Id不能为空" })
  moduleId: number;
}
