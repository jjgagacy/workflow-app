import { IsNotEmpty } from 'class-validator';

export class BasePermDto {
  @IsNotEmpty({ message: 'validation.NOT_EMPTY' })
  key: string;
  level?: number;
}
