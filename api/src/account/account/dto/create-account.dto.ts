import { IsEmail, IsNotEmpty, IsOptional } from 'class-validator';
import { BaseAccountDto } from './base-account.dto';

export class CreateAccountDto extends BaseAccountDto {
  @IsNotEmpty({ message: 'validation.NOT_EMPTY' })
  username: string;
  @IsOptional()
  password?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsNotEmpty({ message: 'validation.NOT_EMPTY' })
  createdBy: string;
  createdAt?: Date;
}
