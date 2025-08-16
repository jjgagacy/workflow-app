import { BadRequestException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { EntityManager, FindManyOptions, FindOptionsOrder, FindOptionsWhere, In, Like, Not, Repository } from "typeorm";
import { RoleEntity } from "./entities/role.entity";
import { MenuEntity } from "./entities/menu.entity";
import { MenuRoleEntity } from "./entities/menu-role.entity";
import { ModulePermEntity } from "./entities/module-perm.entity";
import { CreateRoleDto } from "./role/dto/create-role.dto";
import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";
import { errorObject } from "src/common/types/errors/error";
import { QueryRoleDto } from "./role/dto/query-role.dto";
import { MenuItem, SetRolePermsDto } from "./perm/dto/set-role-perms.dto";
import { RolePermsInterface } from "./perm/interfaces/role-perms.interface";
import { scopeStringToObject } from "./interfaces/scope.interface";
import { UpdateRoleDto } from "./role/dto/update-role.dto";

@Injectable()
export class RoleService {
    constructor(
        @InjectRepository(RoleEntity)
        private readonly roleRepository: Repository<RoleEntity>,
        @InjectRepository(MenuEntity)
        private readonly menuRepository: Repository<MenuEntity>,
        @InjectRepository(ModulePermEntity)
        private readonly modulePermRepository: Repository<ModulePermEntity>,
    ) {}

    async resolveRoles(roleIds?: number[]): Promise<RoleEntity[] | undefined> {
        if (!roleIds?.length) return undefined;

        const roles = await this.roleRepository.findBy({ id: In(roleIds) });
        return roles.length > 0 ? roles : undefined;
    }

    async getExistingCount(...roleIds: number[]): Promise<number> {
        return await this.roleRepository.count({
            where: { id: In(roleIds) }
        });
    }

    /**
     * 创建角色
     */
    async create(dto: CreateRoleDto): Promise<RoleEntity> {
        const validateObj = plainToInstance(CreateRoleDto, dto);
        const errors = await validate(validateObj);
        if (errors.length > 0) {
            throw new BadRequestException(
                errorObject('DTO验证错误', { key: errors.toString() }),
            );
        }

        // 并行检查唯一性
        const [existingByKey, existingByName] = await Promise.all([
            this.roleRepository.findOneBy({ key: dto.key }),
            this.roleRepository.findOneBy({
                parent: dto.parent,
                name: dto.name
            }),
        ]);

        if (existingByKey) {
            throw new BadRequestException(
                errorObject('角色key已存在', { key: dto.key }),
            );
        }
        if (existingByName) {
            throw new BadRequestException(
                errorObject('相同父级下角色名称已存在', { key: dto.name }),
            );
        }

        const roleEntity = this.roleRepository.create({
            key: dto.key,
            name: dto.name,
            parent: dto.parent,
            status: dto.status,
            operate: this.mapOperateFields(dto),
        });

        return this.roleRepository.save(roleEntity);
    }

    private mapOperateFields(dto: CreateRoleDto) {
        return {
            createdAt: dto.createdAt || new Date(),
            createdBy: dto.createdBy,
        };
    }

    /**
     * 更新角色
     */
    async update(dto: Partial<UpdateRoleDto>): Promise<RoleEntity | null> {
        const validateObj = plainToInstance(UpdateRoleDto, dto);
        const errors = await validate(validateObj);
        if (errors.length > 0) {
            throw new BadRequestException(
                errorObject('DTO验证错误', { key: errors.toString() }),
            );
        }
        if (!dto.id && !dto.key) {
            throw new BadRequestException(
                errorObject('请提供更新人id', { key: dto.id, key2: dto.key }),
            );
        }
        const where = dto.id ? { id : dto.id } : { key : dto.key };
        const role = await this.roleRepository.findOneBy(where);
        if (!role) {
            throw new BadRequestException(
                errorObject('角色不存在', { key: dto.id }),
            );
        }
        // 检查key唯一性
        // 检查name唯一性
        const [existKey, existName] = await Promise.all([
            this.roleRepository.findOneBy({ key: dto.key, id: Not(role.id) }),
            await this.roleRepository.existsBy({
                name: dto.name,
                parent: role.parent,
                id: Not(role.id)
            })
        ]);
        if (existKey) {
            throw new BadRequestException(
                errorObject('角色key已存在', { key: dto.id, key2: dto.key }),
            );
        }
        if (existName) {
            throw new BadRequestException(
                errorObject('角色名称已存在', { key: dto.name, key2: parent }),
            );
        }

        await this.roleRepository.update(role.id, {
            key: dto.key,
            name: dto.name,
            parent: dto.parent,
            status: dto.status || 0,
            operate: {
                ...role.operate,
                updatedBy: dto.updatedBy,
                updatedAt: dto.updatedAt || new Date()
            }
        });

        return this.roleRepository.findOneBy({ id: role.id });
    }

    /**
     * 删除角色
     */
    async deleteById(id: number): Promise<void> {
        const role = await this.roleRepository.findOneBy({ id });
        if (!role) {
            throw new BadRequestException(
                errorObject('角色ID不存在', { key: id }),
            );
        }
        await this.deleteRoleAndChildren(role.key);
    }

    /**
     * 删除角色
     */
    async deleteByKey(key: string, parent: string): Promise<void> {
        const role = await this.roleRepository.findOneBy({ key, parent });
        if (!role) {
            throw new BadRequestException(
                errorObject('角色不存在', { key, key2: parent }),
            );
        }
        await this.roleRepository.delete({ key, parent });
    }

    /**
     * 查询角色
     */
    async query(queryParams: Partial<QueryRoleDto> | GetRoleListArgs): Promise<{
        data: RoleEntity[];
        total: number
    }> {
        const dto = new QueryRoleDto();
        if (queryParams instanceof QueryRoleDto) {
            Object.assign(dto, queryParams);
        } else {
            dto.setQueryArgs(queryParams as GetRoleListArgs);
        }

        const where: FindOptionsWhere<RoleEntity> = {
            ...(dto.name && { name: Like(`%${dto.name}%`) }),
            ...(dto.id && { id: dto.id }),
            ...(dto.status !== undefined && { status: dto.status }),
            ...(dto.parent && { parent: dto.parent }),
            ...(dto.key && { key: dto.key }),
        };
        // 构建排序
        const order: FindOptionsOrder<RoleEntity> = { ...dto.order };
        // 构建查询选项
        const options: FindManyOptions<RoleEntity> = {
            where,
            order,
            ...(dto.relations && dto.relations),
            ...(dto.paginate && { skip: dto.skip || 0, take: dto.limit || 10 })
        };

        // 执行查询
        if (dto.paginate) {
            const [data, total] = await this.roleRepository.findAndCount(options);
            return { data, total };
        } else {
            const data = await this.roleRepository.find(options);
            return { data, total: data.length };
        }
    }

    /**
     * 获取角色详情
     */
    async getRoleByKey(key: string): Promise<RoleEntity | null> {
        return this.roleRepository.findOneBy({ key });
    }

    /**
     * 设置角色权限
     */
    async setRolePerms(dto: SetRolePermsDto): Promise<void> {
        const validateObj = plainToInstance(SetRolePermsDto, dto);
        const errors = await validate(validateObj);
        if (errors.length > 0) {
            throw new BadRequestException(
                errorObject('DTO验证错误', { key: errors.toString() }),
            );
        }

        const role = await this.getRoleByKey(dto.key);
        if (!role) {
            throw new BadRequestException(
                errorObject('角色不存在', { key: dto.key }),
            );
        }

        await this.roleRepository.manager.transaction(async (manager) => {
            // 删除现有权限
            await manager.delete(MenuRoleEntity, { role: { id: role.id } });

            // 批量设置新权限
            for (const menuItem of dto.menus) {
                if (menuItem.scope.length === 0) {
                    throw new BadRequestException(
                        errorObject('菜单权限范围不能为空'),
                    );
                }

                const menu = await this.menuRepository.findOneBy({ key: menuItem.key });
                if (!menu) {
                    throw new BadRequestException(
                        errorObject('菜单不存在', { key: menuItem.key}),
                    );
                }

                // 获取权限实体
                const perms = await Promise.all(
                    menuItem.perms.map(permKey =>
                        this.modulePermRepository.findOneBy({ key: permKey })
                    )
                ).then(results => results.filter(Boolean));

                // 创建菜单角色关联
                const menuRole = manager.create(MenuRoleEntity, {
                    menu,
                    role,
                    scope: menuItem.scope.join(','),
                    perms: perms as ModulePermEntity[],
                });

                await manager.save(menuRole);

                // 处理父菜单
                await this.processParentMenus(manager, role, menu, menuItem);
            }
        });
    }

    /**
     * 处理父菜单权限
     */
    private async processParentMenus(
        manager: EntityManager,
        role: RoleEntity,
        menu: MenuEntity,
        menuItem: MenuItem
    ): Promise<void> {
        let currentMenu = menu;
        while (currentMenu.parent) {
            const parent = await this.menuRepository.findOneBy({
                key: currentMenu.parent
            });
            if (!parent) break;

            // 如果父菜单不在分配列表中，则添加基础权限
            const exists = menuItem.perms.some(m => m === parent.key);
            if (!exists) {
                const existingParentRole = await manager.findOne(MenuRoleEntity, {
                    where: {
                        menu: { id: parent.id },
                        role: { id: role.id }
                    }
                });

                if (!existingParentRole) {
                    await manager.save(MenuRoleEntity, {
                        menu: parent,
                        role,
                        scope: menuItem.scope.join(','),
                        perms: [],
                    });
                }
            }

            currentMenu = parent;
        }
    }

    /**
     * 获取角色权限
     */
    async getRolePerms(key: string): Promise<RolePermsInterface[]> {
        const role = await this.roleRepository.findOne({
            where: { key },
            relations: ['menus', 'menus.menu', 'menus.perms'],
        });

        if (!role) {
            throw new BadRequestException(
                errorObject('角色不存在', { key }),
            );
        }

        return role.menus.map(menuItem => ({
            menu: menuItem.menu,
            perms: menuItem.perms,
            scope: scopeStringToObject(menuItem.scope),
        }));
    }

    private async deleteRoleAndChildren(key: string): Promise<void> {
        await this.roleRepository.manager.transaction(async (manager) => {
            // 使用CTE递归查询所有子菜单
            const childKeys = await manager.query(
                `WITH RECURSIVE role_tree AS (
                SELECT id,key FROM role WHERE parent = $1
                UNION ALL
                SELECT r.id,r.key FROM role r
                JOIN role_tree t on r.parent = t.key
                )
                SELECT id,key FROM role_tree`,
                [key]
            );

            // 批量删除所以子角色
            if (childKeys.length > 0) {
                await manager.delete(
                    RoleEntity,
                    childKeys.map(c => c.id)
                );
            }
            // 删除当前角色
            await manager.delete(RoleEntity, { key });
        });
    }

}