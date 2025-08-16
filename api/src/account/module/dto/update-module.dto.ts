import { IsNotEmpty } from 'class-validator';
import { BaseModuleDto } from './base.dto';

export class UpdateModuleDto extends BaseModuleDto {
    @IsNotEmpty({ message: "id不能为空" })
    id: number;
}
