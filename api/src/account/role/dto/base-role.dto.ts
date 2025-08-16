import { IsNotEmpty } from 'class-validator';

export abstract class BaseRoleDto {
  @IsNotEmpty({ message: "角色Key不能为空" })
  key: string;
  parent: string;
  status?: number;
}
