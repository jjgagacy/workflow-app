import { IsNotEmpty } from 'class-validator';

/**
 * Menu dto
 */
export abstract class BaseMenuDto {
  @IsNotEmpty({ message: "菜单Key不能为空" })
  key: string;
  parent: string;

  @IsNotEmpty({ message: "菜单名称不能为空" })
  name: string;

  icon?: string;
  sort?: number;
  status?: number;

  moduleId?: number;
}
