import { IsNotEmpty } from 'class-validator';
import { BasePermDto } from './base.dto';

export class CreatePermDto extends BasePermDto {
  @IsNotEmpty({ message: "权限名称不能为空" })
  name: string;
}
