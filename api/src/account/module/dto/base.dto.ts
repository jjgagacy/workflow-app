import { IsNotEmpty } from 'class-validator';

export abstract class BaseModuleDto {
  @IsNotEmpty({ message: 'validation.NOT_EMPTY' })
  key: string;
  @IsNotEmpty({ message: 'validation.NOT_EMPTY' })
  name: string;
}
