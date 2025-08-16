import { IsNotEmpty } from 'class-validator';
import { BaseAccountDto } from './base-account.dto';

export class UpdateAccountDto extends BaseAccountDto { 
  username?: string;
  updatedAt?: Date;
  password?: string;
  @IsNotEmpty({ message: "更新人不能为空" })
  updatedBy: string;
}
