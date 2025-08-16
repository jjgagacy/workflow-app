import { IsNotEmpty } from 'class-validator';

export abstract class BaseModuleDto {
  @IsNotEmpty({ message: "模块Key不能为空" })
  key: string;
  @IsNotEmpty({ message: "菜单名称不能为空" })
  name: string;
}
