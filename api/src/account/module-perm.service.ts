import { BadRequestException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { ModuleEntity } from "./entities/module.entity";
import { Repository } from "typeorm";
import { ModulePermEntity } from "./entities/module-perm.entity";
import { PermEntity } from "./entities/perm.entity";
import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";
import { errorObject } from "@/common/types/errors/error";
import { CreateModulePermDto } from "./perm/dto/create-module-perm.dto";
import { UpdateModulePermDto } from "./perm/dto/update-module-perm.dto";

@Injectable()
export class ModulePermService {
    constructor(
        @InjectRepository(ModuleEntity)
        private readonly moduleRepository: Repository<ModuleEntity>,
        @InjectRepository(ModulePermEntity)
        private readonly modulePermRepository: Repository<ModulePermEntity>
    ) { }

    /**
     * 获取权限组的权限
     * @param moduleId 
     * @param permKey 
     * @returns 
     */
    async getModulePermission(moduleId: number | string, permKey: string): Promise<ModulePermEntity | null> {
        const moduleWhere = typeof (moduleId) === 'number' ? { id: moduleId } : { key: moduleId };
        const modulePerm = await this.modulePermRepository.findOne({
            where: { module: moduleWhere, key: permKey },
        });
        return modulePerm;
    }

    /**
     * 获取权限组的权限列表
     * @param module 
     * @returns 
     */
    async getModulePermissions(id: number | string): Promise<ModulePermEntity[] | null> {
        const where = typeof (id) === 'number' ? { id } : { key: id };
        const moduleWithPerms = await this.moduleRepository.findOne({
            relations: { perms: true },
            where,
            // cache: true, // 添加查询缓存
        });
        return moduleWithPerms?.perms || null;
    }

    /**
     * 重置权限组的权限列表
     * @param module 
     * @param perms 
     */
    async setModulePermissions(module: ModuleEntity, perms: ModulePermEntity[]): Promise<void> {
        await this.moduleRepository.save({
            ...module,
            perms,
        });
    }

    /**
     * 添加权限到权限组
     * @param module 
     * @param perms 
     */
    async appendModulePermissions(module: ModuleEntity, perms: ModulePermEntity[]): Promise<void> {
        const currentPerms = module.perms ?? await this.getModulePermissions(module.id);
        await this.setModulePermissions(module, [...currentPerms, ...perms]);
    }

    /**
     * 清除权限组的权限
     * @param module 
     */
    async clearModulePermissions(module: ModuleEntity): Promise<void> {
        await this.setModulePermissions(module, []);
    }

    /**
     * 删除权限组指定的权限
     * @param module 
     * @param permsToRemove 
     */
    async removePermissionsFromModule(
        module: ModuleEntity,
        permsToRemove: ModulePermEntity[]
    ): Promise<void> {
        const currentPerms = module.perms ?? await this.getModulePermissions(module.id);
        const permKeysToRemove = new Set(permsToRemove.map(p => p.key));

        const remainingPerms = currentPerms.filter(
            perm => !permKeysToRemove.has(perm.key)
        );

        await this.modulePermRepository.manager.transaction(async (manager) => {
            await manager.delete(ModulePermEntity, permsToRemove.map(x => x.id)); // remove() failed: Cannot read properties of undefined (reading 'inverseJoinColumns')
            await manager.save(ModuleEntity, {
                ...module,
                perms: remainingPerms,
            });
        });
    }

    /**
     * 获取权限详情
     * @param key 
     * @returns 
     */
    async getPermission(key: string, moduleId: number | string): Promise<ModulePermEntity | null> {
        const moduleWhere = typeof moduleId === 'number' ? { id: moduleId } : { key: moduleId };
        return this.modulePermRepository.findOne({
            where: { key, ...{ module: moduleWhere } },
        });
    }

    /**
     * 给权限设置级别
     * @param permission 
     * @param levels 
     */
    async setPermissionLevels(
        permission: ModulePermEntity,
        levels: PermEntity[]
    ): Promise<void> {
        await this.modulePermRepository.save({
            ...permission,
            levels,
        });
    }

    /**
     * 创建权限
     * @param dto 
     * @returns 
     */
    async createPermission(dto: CreateModulePermDto): Promise<ModulePermEntity> {
        const validateObj = plainToInstance(CreateModulePermDto, dto);
        const errors = await validate(validateObj);
        if (errors.length > 0) {
            throw new BadRequestException(
                errorObject('DTO验证错误', { details: errors.toString() })
            );
        }

        if (await this.getPermission(dto.key, dto.moduleId)) {
            throw new BadRequestException(errorObject(`权限key已存在`, { key: dto.key }));
        }

        const module = await this.moduleRepository.findOneBy({ id: dto.moduleId });
        if (!module) {
            throw new BadRequestException(errorObject(`模块已存在`, { key: dto.moduleId }));
        }

        return this.modulePermRepository.save(
            this.modulePermRepository.create({
                key: dto.key,
                name: dto.name,
                restrictLevel: dto.restrictLevel,
                module
            })
        );
    }

    /**
     * 更新权限
     * @param dto 
     * @returns 
     */
    async updatePermission(dto: UpdateModulePermDto): Promise<ModulePermEntity> {
        const validateObj = plainToInstance(UpdateModulePermDto, dto);
        const errors = await validate(validateObj);
        if (errors.length > 0) {
            throw new BadRequestException(
                errorObject('DTO验证错误', { key: errors.toString() })
            );
        }

        const permission = await this.getPermission(dto.key, dto.module);
        if (!permission) {
            throw new BadRequestException(errorObject(`权限不存在`, { key: dto.key }));
        }

        return this.modulePermRepository.save({
            ...permission,
            name: dto.name ?? permission.name,
            restrictLevel: dto.restrictLevel ?? permission.restrictLevel,
        });
    }

    /**
     *删除权限
     */
    async deletePermission(key: string, module: number | string): Promise<void> {
        const permission = await this.getPermission(key, module);
        if (!permission) {
            throw new BadRequestException(errorObject(`权限不存在`, { key }));
        }
        await this.modulePermRepository.remove(permission);
    }

}