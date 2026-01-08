import { IsNotEmpty } from 'class-validator';

export abstract class BaseRoleDto {
  @IsNotEmpty({ message: 'validation.NOT_EMPTY' })
  key: string;
  parent: string;
  status?: number;
  @IsNotEmpty({ message: 'validation.NOT_EMPTY' })
  tenantId: string;
}
