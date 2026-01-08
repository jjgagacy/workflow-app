import { Injectable } from "@nestjs/common";
import { MenuEntity } from "./entities/menu.entity";
import { Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { RoleEntity } from "./entities/role.entity";
import { I18nService } from "nestjs-i18n";
import { I18nTranslations } from "@/generated/i18n.generated";
import { InvalidInputGraphQLException } from "@/common/exceptions";

@Injectable()
export class MenuRoleService {
  constructor(
    @InjectRepository(MenuEntity)
    private readonly menuRepository: Repository<MenuEntity>,
    private readonly i18n: I18nService<I18nTranslations>,
  ) { }

  async getMenuRoles(menuId: number): Promise<RoleEntity[] | null> {
    const menu = await this.menuRepository.findOne({
      relations: { roles: { role: true } },
      where: { id: menuId }
    });
    if (!menu) return null;
    return menu.roles.map((role) => role.role);
  }

  async clear(menuId: number): Promise<void> {
    const menu = await this.menuRepository.findOne({
      where: { id: menuId },
      relations: { roles: true }
    });
    if (!menu) {
      throw new InvalidInputGraphQLException(this.i18n.t('system.ID_NOT_EXIST', { args: { id: menuId } }));
    }
    menu.roles = [];
    await this.menuRepository.save(menu);
  }
}