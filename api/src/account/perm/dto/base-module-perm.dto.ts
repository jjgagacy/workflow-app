import { IsNotEmpty } from 'class-validator';

export class BaseModulePermDto {
  @IsNotEmpty({ message: "模块Key不能为空" })
  key: string;
  restrictLevel?: number;
}
