import { IsNotEmpty } from 'class-validator';

export abstract class BaseDepDto {
  @IsNotEmpty({ message: 'validation.NOT_EMPTY' })
  key: string;
  parent: string;
  managerId?: number;

  @IsNotEmpty({ message: 'validation.NOT_EMPTY' })
  name: string;
  remarks?: string;
}
