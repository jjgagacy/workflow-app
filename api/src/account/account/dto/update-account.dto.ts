import { IsEmail, IsNotEmpty, IsOptional } from 'class-validator';
import { BaseAccountDto } from './base-account.dto';

export class UpdateAccountDto extends BaseAccountDto {
  username?: string;
  updatedAt?: Date;
  password?: string;
  @IsNotEmpty({ message: 'validation.NOT_EMPTY' })
  updatedBy: string;
  @IsOptional()
  @IsEmail()
  email?: string;
}
