import { IsNotEmpty } from 'class-validator';

/**
 * Menu dto
 */
export abstract class BaseMenuDto {
  @IsNotEmpty({ message: 'validation.NOT_EMPTY' })
  key: string;
  parent: string;

  @IsNotEmpty({ message: 'validation.NOT_EMPTY' })
  name: string;

  icon?: string;
  sort?: number;
  status?: number;

  moduleId?: number;
}
