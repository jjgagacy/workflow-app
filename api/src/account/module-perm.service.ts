import { BadRequestException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { ModuleEntity } from "./entities/module.entity";
import { Repository } from "typeorm";
import { ModulePermEntity } from "./entities/module-perm.entity";
import { PermEntity } from "./entities/perm.entity";
import { CreateModulePermDto } from "./perm/dto/create-module-perm.dto";
import { UpdateModulePermDto } from "./perm/dto/update-module-perm.dto";
import { I18nService } from "nestjs-i18n";
import { I18nTranslations } from "@/generated/i18n.generated";
import { validateDto } from "@/common/utils/validation";

@Injectable()
export class ModulePermService {
  constructor(
    @InjectRepository(ModuleEntity)
    private readonly moduleRepository: Repository<ModuleEntity>,
    @InjectRepository(ModulePermEntity)
    private readonly modulePermRepository: Repository<ModulePermEntity>,
    private readonly i18n: I18nService<I18nTranslations>,
  ) { }

  /**
   * 获取权限组的权限
   * @param moduleId 
   * @param permKey 
   * @returns 
   */
  async getModulePermission(moduleId: number | string, permKey: string, tenantId: string): Promise<ModulePermEntity | null> {
    const moduleWhere = typeof (moduleId) === 'number' ? { id: moduleId } : { key: moduleId };
    const modulePerm = await this.modulePermRepository.findOne({
      where: { module: moduleWhere, key: permKey, tenantId },
    });
    return modulePerm;
  }

  /**
   * 获取权限组的权限列表
   * @param module 
   * @returns 
   */
  async getModulePermissions(id: number | string, tenantId: string): Promise<ModulePermEntity[] | null> {
    const where = typeof (id) === 'number' ? { id, tenantId } : { key: id, tenantId };
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
    const currentPerms = module.perms ?? await this.getModulePermissions(module.id, module.tenant.id);
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
    const currentPerms = module.perms ?? await this.getModulePermissions(module.id, module.tenant.id);
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
  async getPermission(key: string, moduleId: number | string, tenantId: string): Promise<ModulePermEntity | null> {
    const moduleWhere = typeof moduleId === 'number' ? { id: moduleId } : { key: moduleId };
    return this.modulePermRepository.findOne({
      where: { key, ...{ module: moduleWhere }, tenantId },
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
    await validateDto(CreateModulePermDto, dto, this.i18n);

    if (await this.getPermission(dto.key, dto.moduleId, dto.tenantId)) {
      throw new BadRequestException(this.i18n.t('system.PERM_KEY_EXISTS', { args: { key: dto.key } }));
    }

    const module = await this.moduleRepository.findOneBy({ id: dto.moduleId, tenant: { id: dto.tenantId } });
    if (!module) {
      throw new BadRequestException(this.i18n.t('system.MODULE_NOT_EXIST', { args: { name: dto.moduleId } }));
    }

    const modulePerm = this.modulePermRepository.create({
      key: dto.key,
      name: dto.name,
      restrictLevel: dto.restrictLevel,
      module,
      tenantId: dto.tenantId,
    });
    return this.modulePermRepository.save(modulePerm);
  }

  /**
   * 更新权限
   * @param dto 
   * @returns 
   */
  async updatePermission(dto: UpdateModulePermDto): Promise<ModulePermEntity> {
    await validateDto(UpdateModulePermDto, dto, this.i18n);

    const permission = await this.getPermission(dto.key, dto.module, dto.tenantId);
    if (!permission) {
      throw new BadRequestException(this.i18n.t('system.PERM_KEY_NOT_EXISTS', { args: { key: dto.key } }));
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
  async deletePermission(key: string, module: number | string, tenantId: string): Promise<void> {
    const permission = await this.getPermission(key, module, tenantId);
    if (!permission) {
      throw new BadRequestException(this.i18n.t('system.PERM_KEY_NOT_EXISTS', { args: { key } }));
    }
    await this.modulePermRepository.remove(permission);
  }

}
