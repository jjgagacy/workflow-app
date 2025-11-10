import { Injectable } from "@nestjs/common";
import { MenuEntity } from "./entities/menu.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { FindManyOptions, FindOptionsWhere, In, Not, Repository } from "typeorm";
import { plainToInstance } from "class-transformer";
import { ModuleEntity } from "./entities/module.entity";
import { QueryMenuDto } from "./menu/dto/query-menu.dto";
import { MenuRoleService } from "./menu-role.service";
import { ModulePermInterface } from "./interfaces/module-perm.interface";
import { DEFAULT_SCOPE } from "./interfaces/scope.interface";
import { ModuleService } from "./module.service";
import { CreateMenuDto } from "./menu/dto/create-menu.dto";
import { UpdateMenuDto } from "./menu/dto/update-menu.dto";
import { MenuInterface } from "./menu/interfaces/menu.interface";
import { I18nService } from "nestjs-i18n";
import { I18nTranslations } from "@/generated/i18n.generated";
import { throwIfDtoValidateFail } from "@/common/utils/validation";
import { BadRequestGraphQLException } from "@/common/exceptions";
import { getPaginationOptions } from "@/common/database/dto/query.dto";
import { isPaginator } from "@/common/database/utils/pagination";

@Injectable()
export class MenuService {
    constructor(
        @InjectRepository(MenuEntity)
        private readonly menuRepository: Repository<MenuEntity>,
        @InjectRepository(ModuleEntity)
        private readonly moduleRepository: Repository<ModuleEntity>,
        private readonly menuRoleService: MenuRoleService,
        private readonly moduleService: ModuleService,
        private readonly i18n: I18nService<I18nTranslations>,
    ) { }

    /**
     * 根据菜单id获取详情
     * @param id 
     * @returns 
     */
    async getById(id: number): Promise<MenuEntity | null> {
        return this.menuRepository.findOne({ where: { id }, relations: { module: true } })
    }

    /**
     * 获取菜单详情
     * @param key - 菜单key
     * @returns 菜单实体或null
     */
    async getByKey(key: string): Promise<MenuEntity | null> {
        return this.menuRepository.findOneBy({ key });
    }

    /**
     * 创建菜单
     * @param dto - 创建DTO
     * @returns 新创建的菜单
     * @throws ConflictException 当key或name重复时
     */
    async create(dto: CreateMenuDto): Promise<MenuEntity | null> {
        const validateObj = plainToInstance(CreateMenuDto, dto);
        const errors = await this.i18n.validate(validateObj);
        throwIfDtoValidateFail(errors);

        // 并行检查key和name唯一性
        const [existingByKey, existingByName] = await Promise.all([
            this.menuRepository.findOneBy({ key: dto.key }),
            this.menuRepository.findOneBy({
                parent: dto.parent,
                name: dto.name
            }),
        ]);

        if (existingByKey) {
            throw new BadRequestGraphQLException(this.i18n.t('system.MENU_KEY_EXISTS', { args: { key: dto.key } }));
        }

        if (existingByName) {
            throw new BadRequestGraphQLException(this.i18n.t('system.CHILD_DUPLICATE', { args: { name: dto.name } }));
        }

        let module: ModuleEntity | null = null;
        if (dto.moduleId) {
            module = await this.moduleRepository.findOneBy({ id: dto.moduleId });
            if (!module) {
                throw new BadRequestGraphQLException(this.i18n.t('system.ID_NOT_EXIST', { args: { id: dto.moduleId } }));
            }
        }

        const menuEntity = this.menuRepository.create({
            key: dto.key,
            name: dto.name,
            parent: dto.parent || '',
            icon: dto.icon || '',
            sort: dto.sort || 0,
            status: dto.status || 0,
        });

        if (module) {
            menuEntity.module = module
        }

        return this.menuRepository.save(menuEntity);
    }

    /**
     * 更新菜单
     * @param dto - 更新DTO
     * @returns 更新后的菜单
     * @throws NotFoundException 当菜单不存在时
     * @throws BadRequestException 当尝试修改parent时
     */
    async update(dto: UpdateMenuDto): Promise<MenuEntity> {
        const validateObj = plainToInstance(UpdateMenuDto, dto);
        const errors = await this.i18n.validate(validateObj);
        throwIfDtoValidateFail(errors);

        const menu = await this.menuRepository.findOne({ where: { key: dto.key }, relations: { module: true } });
        if (!menu) {
            throw new BadRequestGraphQLException(this.i18n.t('system.MENU_NOT_EXIST', { args: { key: dto.key } }));
        }

        // 3. 如果要修改parent或name，检查同级菜单名称唯一性
        if (dto.parent !== undefined || dto.name !== undefined) {
            const newParent = dto.parent !== undefined ? dto.parent : menu.parent;
            const newName = dto.name !== undefined ? dto.name : menu.name;

            const existingSameName = await this.menuRepository.findOneBy({
                parent: newParent,
                name: newName,
                key: Not(dto.key) // 排除当前菜单
            });

            if (existingSameName) {
                throw new BadRequestGraphQLException(this.i18n.t('system.CHILD_DUPLICATE', { args: { name: newName } }));
            }
        }

        // 4. 更新菜单
        const updatedMenu = this.menuRepository.create({
            ...menu,
            ...(dto.parent !== undefined && { parent: dto.parent }),
            ...(dto.name !== undefined && { name: dto.name }),
            ...(dto.icon !== undefined && { icon: dto.icon }),
            ...(dto.sort !== undefined && { sort: dto.sort }),
            ...(dto.status !== undefined && { status: dto.status }),
        });

        if (dto.moduleId && menu.module?.id != dto.moduleId) {
            const module = await this.moduleRepository.findOneBy({ id: dto.moduleId });
            if (module) updatedMenu.module = module;
        }

        return this.menuRepository.save(updatedMenu);
    }

    /**
     * 删除菜单及其子菜单
     * @param id - 菜单ID
     * @throws BadRequestException 当菜单不存在时
     */
    async deleteById(id: number): Promise<void> {
        const menu = await this.menuRepository.findOneBy({ id });
        if (!menu) {
            throw new BadRequestGraphQLException(this.i18n.t('system.ID_NOT_EXIST', { args: { id } }));
        }

        await this.deleteMenuAndChildren(menu.key);
    }

    /**
     * 删除菜单及其子菜单
     * @param key - 菜单key
     * @param parent - 父菜单key
     * @throws BadRequestException 当菜单不存在时
     */
    async deleteByKey(key: string, parent: string): Promise<void> {
        const menu = await this.menuRepository.findOneBy({ key, parent });
        if (!menu) {
            throw new BadRequestGraphQLException(this.i18n.t('system.MENU_NOT_EXIST', { args: { key } }));
        }

        await this.deleteMenuAndChildren(menu.key);
    }

    /**
     * 递归删除菜单及其子菜单
     * @param menuKey - 菜单key
     */
    private async deleteMenuAndChildren(menuKey: string): Promise<void> {
        await this.menuRepository.manager.transaction(async (manager) => {
            // 使用CTE递归查询所有子菜单
            const childKeys = await manager.query(
                `WITH RECURSIVE menu_tree AS (
                SELECT key FROM menu WHERE parent = $1
                UNION ALL
                SELECT m.key FROM menu m
                JOIN menu_tree t ON m.parent = t.key
                )
                SELECT key FROM menu_tree`,
                [menuKey]
            );

            // 批量删除所有子菜单
            if (childKeys.length > 0) {
                await manager.delete(
                    MenuEntity,
                    { key: In(childKeys.map(c => c.key)) }
                );
            }
            // 删除当前菜单
            await manager.delete(MenuEntity, { key: menuKey });
        });
    }

    /**
     * 查询菜单列表
     * @param dto - 查询DTO
     * @returns 包含数据和总数的对象
     */
    async query(queryParams: Partial<QueryMenuDto> | GetMenuArgs): Promise<{ data: MenuEntity[]; total: number }> {
        const dto = new QueryMenuDto();
        if (queryParams instanceof QueryMenuDto) {
            Object.assign(dto, queryParams);
        } else {
            dto.setQueryArgs(queryParams as GetMenuArgs);
        }
        // 1. 构建查询条件
        const where: FindOptionsWhere<MenuEntity> = {
            ...(dto.name && { name: dto.name }),
            ...(dto.status !== undefined && { status: dto.status }),
            ...(dto.parent && { parent: dto.parent }),
            ...(dto.key && { key: dto.key }),
        };
        // 2. 构建排序条件
        const order = dto.order ? { ...dto.order } : {};
        // 构建查询选项
        const options: FindManyOptions<MenuEntity> = {
            where,
            order,
            ...(dto.relations && { relations: dto.relations }),
            ...(getPaginationOptions(dto)),
        };

        // 执行查询
        if (isPaginator(dto)) {
            const [data, total] = await this.menuRepository.findAndCount(options);
            return { data, total };
        } else {
            const data = await this.menuRepository.find(options);
            return { data, total: data.length };
        }
    }

    async getMenus(): Promise<MenuInterface[]> {
        // 1. 查询所有启用的菜单并按排序字段升序排列
        const { data: menus } = await this.query({
            status: 1,
            order: { sort: 'ASC' }
        });

        // 2. 创建菜单映射表并初始化子菜单数组
        const menuMap = new Map<string, MenuInterface>();
        menus.forEach(menu => {
            menuMap.set(menu.key, {
                ...menu,
                children: [],
                roles: [] // 预初始化roles数组
            });
        });

        // 3. 并行获取所有菜单的角色信息
        const menuRolesPromises = Array.from(menuMap.values()).map(async menuNode => {
            const menu = await this.getByKey(menuNode.key);
            if (!menu) return { menuKey: null, }
            const roles = await this.menuRoleService.getMenuRoles(menu?.id);
            return { menuKey: menuNode.key, roles };
        });

        const menuRoleResults = await Promise.all(menuRolesPromises);

        // 4. 更新菜单角色信息
        menuRoleResults.forEach(({ menuKey, roles }) => {
            if (!menuKey) return;
            const menuNode = menuMap.get(menuKey);
            if (menuNode && roles) {
                menuNode.roles = roles.map(role => ({
                    id: role.id,
                    key: role.key,
                    name: role.name
                }));
            }
        });

        // 5. 构建菜单树
        const tree: MenuInterface[] = [];
        menuMap.forEach(menuNode => {
            if (!menuNode.parent) {
                tree.push(menuNode);
            } else {
                const parent = menuMap.get(menuNode.parent);
                parent?.children?.push(menuNode);
            }
        });

        return tree;
    }

    async getFlatMenus(args: Partial<GetMenuArgs>): Promise<MenuInterface[]> {
        if (args.withModulePerm) args.withModule = true;
        // 1. 构建查询条件
        const dto = new QueryMenuDto();
        dto.setQueryArgs(args);
        dto.order = { sort: 'ASC' };
        dto.relations = {
            ...(args.withModule && { module: true }),
            ...(args.withRoles && { roles: true })
        };
        // 2. 查询菜单数据
        const { data: menus } = await this.query(dto);
        // 3. 并行处理菜单项
        const menuPromises = menus.map(async menu => {
            // 4. 获取模块权限（如果需要）
            let modulePerm: ModulePermInterface[] | null = null;
            if (args.withModulePerm && menu.module?.key) {
                const perms = await this.moduleService.getModulePerms(menu.module.key);
                if (perms) {
                    modulePerm = perms.map(perm => ({
                        key: perm.key,
                        name: perm.name,
                        restrictLevel: perm.restrictLevel
                    }));
                }
            }
            // 5. 构建返回的菜单项
            return {
                id: menu.id,
                key: menu.key,
                name: menu.name,
                parent: menu.parent,
                status: menu.status,
                sort: menu.sort,
                icon: menu.icon,
                module: menu.module,
                modulePerm,
                scope: args.withScope ? DEFAULT_SCOPE : null
            } as MenuInterface;
        });
        // 6. 等待所有菜单项处理完成
        return Promise.all(menuPromises);
    }
}


// https://github.com/doug-martin/nestjs-query/blob/master/examples/custom-service/src/todo-item/todo-item.service.ts
