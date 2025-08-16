import { BadRequestException, Injectable } from "@nestjs/common";
import { MenuEntity } from "./entities/menu.entity";
import { Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { RoleEntity } from "./entities/role.entity";
import { errorObject } from "src/common/types/errors/error";

@Injectable()
export class MenuRoleService {
    constructor(
        @InjectRepository(MenuEntity)
        private readonly menuRepository: Repository<MenuEntity>,
    ) {}

    async getMenuRoles(menuId: number): Promise<RoleEntity[] | null> {
        const menu = await this.menuRepository.findOne({
            relations: { roles: { role: true }},
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
            throw new BadRequestException(errorObject("菜单ID不存在", { key: menuId }));
        }
        menu.roles = [];
        await this.menuRepository.save(menu);
    }
}