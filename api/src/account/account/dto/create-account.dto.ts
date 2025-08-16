import { IsNotEmpty } from 'class-validator';
import { BaseAccountDto } from './base-account.dto';

export class CreateAccountDto extends BaseAccountDto {
  @IsNotEmpty({ message: "username不能为空" })
  username: string;
  @IsNotEmpty({ message: "密码不能为空" })
  password: string;
  createdAt?: Date;
  @IsNotEmpty({ message: "操作人不能为空" })
  createdBy: string;
}
