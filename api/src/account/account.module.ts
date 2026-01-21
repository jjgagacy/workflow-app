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
import { MonieConfig } from '@/monie/monie.config';
import { SystemService } from '@/monie/system.service';
import { TenantEntity } from './entities/tenant.entity';
import { TenantAccountEntity } from './entities/tenant-account.entity';
import { ProviderEntity } from './entities/provider.entity';
import { ProviderModelEntity } from './entities/provider-model.entity';
import { TenantDefaultModelEntity } from './entities/tenant-default-model.entity';
import { TenantPreferredProviderEntity } from './entities/tenant-preferred-provider.entity';
import { ProviderModelSettingEntity } from './entities/provider-model-setting.entity';
import { OperationLogsEntity } from './entities/operation-log.entity';
import { AccountIntegrateEntity } from './entities/account-integrate.entity';
import { UserEntity } from './entities/user.entity';
import { UploadFilesEntity } from './entities/upload-files.entity';

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
      AccountEntity,
      TenantEntity,
      TenantAccountEntity,
      ProviderEntity,
      ProviderModelEntity,
      TenantDefaultModelEntity,
      TenantPreferredProviderEntity,
      ProviderModelSettingEntity,
      OperationLogsEntity,
      AccountIntegrateEntity,
      UserEntity,
      UploadFilesEntity,
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
    MonieConfig,
    SystemService,
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
    AuthService,
    ModulePermManageService,
    JwtService,
    TypeOrmModule,
  ]
})
export class AccountModule { }
