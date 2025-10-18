import { Global, Module } from '@nestjs/common';
import { AccountService } from "./account.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AccountEntity } from "./entities/account.entity";
import { DepEntity } from './entities/dep.entity';
import { RoleEntity } from './entities/role.entity';
import { MenuEntity } from './entities/menu.entity';
import { ModuleEntity } from './entities/module.entity';
import { PermEntity } from './entities/perm.entity';
import { ModulePermEntity } from './entities/module-perm.entity';
import { MenuRoleEntity } from './entities/menu-role.entity';
import { DepService } from './dep.service';
import { MenuService } from './menu.service';
import { AccountRoleService } from './account-role.service';
import { MenuRoleService } from './menu-role.service';
import { RoleMenuService } from './role-menu.service';
import { ModuleService } from './module.service';
import { ModulePermService } from './module-perm.service';
import { PermService } from './perm.service';
import { RoleService } from './role.service';
import { ModulePermManageService } from './module-perm-manage.service';
import { AuthService } from '@/auth/auth.service';
import { JwtService } from '@nestjs/jwt';

@Global()
@Module({
    imports: [
        TypeOrmModule.forFeature([
            DepEntity,
            RoleEntity,
            MenuEntity,
            ModuleEntity,
            PermEntity,
            ModulePermEntity,
            MenuRoleEntity,
            AccountEntity
        ]),
    ],
    controllers: [],
    providers: [
        AccountService,
        DepService,
        MenuService,
        AccountRoleService,
        MenuRoleService,
        RoleMenuService,
        ModuleService,
        ModulePermService,
        PermService,
        RoleService,
        ModulePermManageService,
        AuthService,
        JwtService,
    ],
    exports: [
        AccountService,
        DepService,
        MenuService,
        AccountRoleService,
        MenuRoleService,
        RoleMenuService,
        ModuleService,
        ModulePermService,
        PermService,
        RoleService,
        ModulePermManageService,
        AuthService,
        JwtService,
    ]
})
export class AccountModule { }
