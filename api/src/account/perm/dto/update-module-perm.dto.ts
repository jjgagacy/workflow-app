import { IsNotEmpty } from "class-validator";
import { BaseModulePermDto } from "./base-module-perm.dto";

export class UpdateModulePermDto extends BaseModulePermDto {
    @IsNotEmpty({ message: '模块不能为空 '})
    module: string;
    @IsNotEmpty({ message: '权限名称不能为空 '})
    name: string;
}
