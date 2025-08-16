import { IsNotEmpty } from 'class-validator';

export abstract class BaseDepDto {
  @IsNotEmpty({ message: "部门Key不能为空" })
  key: string;
  parent: string;
  managerId?: number;

  @IsNotEmpty({ message: "部门名称不能为空" })
  name: string;
  remarks?: string;
}
