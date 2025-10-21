import { IsNotEmpty } from 'class-validator';
import { BaseModuleDto } from './base.dto';

export class UpdateModuleDto extends BaseModuleDto {
    @IsNotEmpty({ message: 'validation.NOT_EMPTY' })
    id: number;
}
