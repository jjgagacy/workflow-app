import { IsNotEmpty } from 'class-validator';
import { BasePermDto } from './base.dto';

export class CreatePermDto extends BasePermDto {
  @IsNotEmpty({ message: 'validation.NOT_EMPTY' })
  name: string;
}
