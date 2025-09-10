import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { FooService } from './foo/foo.service';
import { AccountService } from './account/account.service';
import { RoleService } from './account/role.service';
import { AccountEntity } from './account/entities/account.entity';
import { PASSWORD_SALT } from './config/constants';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AppService {

  constructor(
    private readonly dataSource: DataSource,
    private readonly fooService: FooService,
    private readonly accountService: AccountService,
    private readonly roleService: RoleService
  ) {}

  async onApplicationBootstrap() {
    // console.log('Application has started successfully [' + (process.env.NODE_ENV || 'dev') + ']');
    // console.log('Database connected:', this.dataSource.isInitialized);
    
    // 测试插入account和dep，插入后会自动更新account中的dep字段是新创建的部门id
    // const accountRepository = this.dataSource.getRepository(AccountEntity);
    // const account = new AccountEntity();
    // account.username = 'admin';
    // account.password = await bcrypt.hash('admin', PASSWORD_SALT);
    // account.realName = 'Administrator';
    // account.email = 'jjgagacy@163.com';
    // account.mobile = '18701470971';
    // account.status = 0; // 0 for active
    // account.lastIp = 'localhost';
    // account.operate = {
    //   createdAt: new Date(),
    //   updatedAt: new Date(),
    //   createdBy: 'system',
    //   updatedBy: 'system',
    // };
    // const deprecate = new DepEntity();
    // deprecate.id = 1; // Assuming the default department has ID 1
    // deprecate.key = 'default';
    // deprecate.name = 'Default Department';
    // deprecate.parent = ''; // Assuming 'root' is the parent key for the default department
    // deprecate.remarks = 'Default department for all users';
    // deprecate.managerId = 0; // Assuming the admin is the manager of the
    // account.dep = deprecate;
    // await accountRepository.save(account);
    // await this.dataSource.manager.save();
    // console.log('Default admin account created:', account);

    // 测试删除dep，删除dep后会更新account中的dep字段为null
    
    // const depRepository = this.dataSource.getRepository(DepEntity);
    // await depRepository.delete(7); // Clear existing departments

    // 测试角色级联删除

    // const accountRepository = this.dataSource.getRepository(AccountEntity);
    // const account = new AccountEntity();
    // account.username = 'admin';
    // account.password = 'admin123';
    // account.realName = 'Administrator';
    // account.email = 'jj@qq.com';
    // account.mobile = '1234567890';
    // account.status = 0; // 0 for active
    // account.lastIp = 'localhost';
    // const oper = {
    //   createdAt: new Date(),
    //   updatedAt: new Date(),
    //   createdBy: 'system',
    //   updatedBy: 'system',
    // }
    // account.operate = oper;
    // const role1 = new RoleEntity();
    // role1.name = 'Admin';
    // role1.key = 'admin';
    // role1.status = 0; // 0 for active
    // role1.parent = '';
    // role1.operate = oper;
    // const role2 = new RoleEntity();
    // role2.name = 'User';
    // role2.key = 'user';
    // role2.status = 0; // 0 for active
    // role2.parent = '';
    // role2.operate = oper;
    // account.roles = [role1, role2];
    // await this.dataSource.manager.save([account]);
    // // 删除account后，同步删除account_role表中的关联数据
    // // await accountRepository.delete({ id: account.id });
    // // 删除角色后，同步删除account_role表中的关联数据
    // await this.dataSource.createQueryBuilder()
    //     .delete()
    //     .from(RoleEntity)
    //     .where("id = :id", { id: role1.id })
    //     .execute();


    // module级联删除测试
    // const moduleRepository = this.dataSource.getRepository(ModuleEntity);
    // const module = new ModuleEntity();
    // module.name = 'Test Modules';
    // module.key = 'test_modules';

    // // // 创建一些权限
    // const perm1 = new ModulePermEntity();
    // perm1.key = 'perm1';
    // perm1.name = 'Permission 1';
    // perm1.restrictLevel = 0;
    // const perm2 = new ModulePermEntity();
    // perm2.key = 'perm2';
    // perm2.name = 'Permission 2';
    // perm2.restrictLevel = 1;
    // module.perms = [perm1, perm2];
    // // 因为有级联关系，所以保存module时会自动保存perms
    // // await this.dataSource.manager.save([perm1, perm2]);
    // await moduleRepository.save(module);
    // // 删除module时会自动删除perms
    // await this.dataSource.createQueryBuilder()
    //   .delete()
    //   .from(ModuleEntity)
    //   .where("id = :id", { id: module.id })
    //   .execute();

    // // 创建一些菜单
    // const menuRepository = this.dataSource.getRepository(MenuEntity);
    // const menu = new MenuEntity();
    // menu.key = 'test_menu';
    // menu.name = 'Test Menu';
    // menu.parent = '';
    // menu.icon = 'test-icon';
    // menu.sort = 1;
    // menu.status = 0; // 0 for active
    // const menu2 = new MenuEntity();
    // menu2.key = 'test_menu2';   
    // menu2.name = 'Test Menu 2';
    // menu2.parent = 'test_menu';
    // menu2.icon = 'test-icon-2';
    // menu2.sort = 2;
    // menu2.status = 0; // 0 for active
    // module.menus = [menu, menu2];

    // await moduleRepository.save(module);
    // // await moduleRepository.delete(module.id); // 删除module时会自动删除menus

    // const level1 = new PermEntity();
    // level1.key = 'level1';
    // level1.name = 'Level 1 Permission';
    // level1.level = 1;
    // const level2 = new PermEntity();
    // level2.key = 'level2';
    // level2.name = 'Level 2 Permission';
    // level2.level = 2;
    // perm1.perms = [level1, level2];
    // perm2.perms = [level1]; // 级联关系，perm1和perm2都包含level1权限
    // await this.dataSource.manager.save([level1, level2]);
    // await this.dataSource.manager.save([perm1, perm2]);

    // await this.dataSource.createQueryBuilder()
    //   .delete()
    //   .from(PermEntity)
    //   .where("id = :id", { id: level1.id })
    //   .execute(); // 删除perm1时会自动删除level1和level2，因为它

    // 创建role
    // const roleRepository = this.dataSource.getRepository(RoleEntity);
    // const role = new RoleEntity();
    // role.name = 'Test Role';
    // role.key = 'test_role';
    // role.status = 0; // 0 for active
    // role.parent = '';
    // role.operate = {
    //   createdAt: new Date(),
    //   updatedAt: new Date(),
    //   createdBy: 'system',
    //   updatedBy: 'system',
    // };
    // await roleRepository.save(role);
    // const role2 = new RoleEntity();
    // role2.name = 'Test Role 2';
    // role2.key = 'test_role_2';  
    // role2.status = 0; // 0 for active
    // role2.parent = '';
    // role2.operate = {
    //   createdAt: new Date(),
    //   updatedAt: new Date(),
    //   createdBy: 'system',
    //   updatedBy: 'system',    
    // };
    // await roleRepository.save(role2);
    // // 测试账户创建和角色关联
    // const account = await this.accountService.create({
    //   username: 'testuser',
    //   password: 'testpassword',
    //   realName: 'Test User',
    //   email: '',
    //   mobile: '',
    //   status: 0, // 0 for active
    //   roles: [role.id, role2.id], // Assuming roles with IDs 1 and 2
    //   createdAt: new Date(),
    //   createdBy: 'system',
    //   updatedAt: new Date(),
    //   updatedBy: 'system',
    // });
    // console.log('Account created:', account);

    // 测试添加管理员
    // const role = await this.roleService.create({
    //   key: 'admin',
    //   name: '超级管理员',
    //   createdBy: 'admin',
    //   parent: '',
    // });
    // const createRes = await this.accountService.create({
    //   username: 'admin',
    //   password: 'admin',
    //   status: 0,
    //   roles: [role.id],
    //   createdBy: 'admin',
    // });
    // console.log(createRes.id);
  }

  getHello(): string {
    return 'Hello World!';
  }
}
