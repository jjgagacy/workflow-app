import { IsNotEmpty } from 'class-validator';
import { BaseAccountDto } from './base-account.dto';

export class CreateAccountDto extends BaseAccountDto {
  @IsNotEmpty({ message: 'validation.NOT_EMPTY' })
  username: string;
  @IsNotEmpty({ message: 'validation.NOT_EMPTY' })
  password: string;
  createdAt?: Date;
  @IsNotEmpty({ message: 'validation.NOT_EMPTY' })
  createdBy: string;
}
