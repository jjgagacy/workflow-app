import { IsEmpty, IsNotEmpty } from 'class-validator';
import { BadRequestException } from '@nestjs/common';
import { errorObject } from 'src/common/types/errors/error';

export class MenuItem {
  @IsNotEmpty()
  key: string;
  @IsEmpty()
  scope: string[];
  @IsEmpty()
  perms: string[];
}

export class SetRolePermsDto {
  @IsNotEmpty({ message: "角色Key不能为空" })
  key: string;

  @IsNotEmpty({ message: "角色菜单不能为空" })
  menus: MenuItem[];
}
