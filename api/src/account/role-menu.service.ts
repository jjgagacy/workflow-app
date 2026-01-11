import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { MenuEntity } from "./entities/menu.entity";
import { RoleEntity } from "./entities/role.entity";
import { Repository } from "typeorm";
import { MenuRoleEntity } from "./entities/menu-role.entity";

@Injectable()
export class RoleMenuService {
  constructor(
    @InjectRepository(RoleEntity)
    private readonly roleRepository: Repository<RoleEntity>,
    @InjectRepository(MenuRoleEntity)
    private readonly menuRoleRepository: Repository<MenuRoleEntity>,
  ) { }

  async getMenus(roleId: number): Promise<MenuRoleEntity[] | null> {
    const role = await this.roleRepository.findOne({
      where: { id: roleId },
      relations: ['menus']
    });
    if (!role) {
      return null;
    }
    return role.menus;
  }

  async setRoleMenus(role: RoleEntity, ...menus: MenuEntity[]): Promise<void> {
    await this.roleRepository.manager.transaction(async (manager) => {
      // 先清空现有菜单
      await manager.delete(MenuRoleEntity, { role: { id: role.id } });

      // 添加新菜单
      if (menus.length > 0) {
        const roleMenus = menus.map(menu =>
          this.menuRoleRepository.create({ role, menu })
        );
        await manager.save(roleMenus);
      }
    });
  }

  async appendRoleMenus(role: RoleEntity, ...menus: MenuEntity[]): Promise<void> {
    if (menus.length === 0) return;

    await this.roleRepository.manager.transaction(async (manager) => {
      // 获取现有菜单避免重复
      const existingMenus = await manager.find(MenuRoleEntity, {
        where: { role: { id: role.id } },
        relations: ['menu']
      });

      const existingMenuIds = new Set(existingMenus.map(rm => rm.menu.id));
      const newMenus = menus.filter(menu => !existingMenuIds.has(menu.id));

      if (newMenus.length > 0) {
        const roleMenus = newMenus.map(menu =>
          this.menuRoleRepository.create({ role, menu })
        );
        await manager.save(roleMenus);
      }
    });
  }

  async clearRoleMenus(roleId: number): Promise<void> {
    await this.menuRoleRepository.delete({ role: { id: roleId } });
  }

  /**
   * 检查角色是否拥有指定菜单
   * @param roleId 角色ID
   * @param menuKey 菜单key
   * @returns boolean
   */
  async hasMenu(roleId: number, menuKey: string): Promise<boolean> {
    return this.menuRoleRepository.existsBy({
      role: { id: roleId },
      menu: { key: menuKey }
    });
  }

}