import { IsEmpty, IsNotEmpty } from 'class-validator';

export class MenuItem {
  @IsNotEmpty()
  key: string;
  @IsEmpty()
  scope: string[];
  @IsEmpty()
  perms: string[];
}

export class SetRolePermsDto {
  @IsNotEmpty({ message: 'validation.NOT_EMPTY' })
  key: string;

  @IsNotEmpty({ message: 'validation.NOT_EMPTY' })
  menus: MenuItem[];
}
