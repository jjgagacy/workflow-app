import { IsNotEmpty } from 'class-validator';

export class BasePermDto {
  @IsNotEmpty({ message: "权限Key不能为空" })
  key: string;
  level?: number;
}
