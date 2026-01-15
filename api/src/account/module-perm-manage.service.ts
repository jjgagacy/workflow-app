import { BadRequestException, Injectable } from "@nestjs/common";
import { ModuleEntity } from "./entities/module.entity";
import { ModulePermEntity } from "./entities/module-perm.entity";
import { ModuleService } from "./module.service";
import { ModulePermService } from "./module-perm.service";
import { CreateModulePermDto } from "./perm/dto/create-module-perm.dto";
import { UpdateModulePermDto } from "./perm/dto/update-module-perm.dto";
import { I18nService } from "nestjs-i18n";
import { I18nTranslations } from "@/generated/i18n.generated";

@Injectable()
export class ModulePermManageService {
  constructor(
    private readonly moduleService: ModuleService,
    private readonly modulePermService: ModulePermService,
    private readonly i18n: I18nService<I18nTranslations>,
  ) { }

  /**
   * 创建权限
   * @param args 
   */
  async create(args: CreateModulePermArgs): Promise<boolean> {
    this.validateModule(args.module);

    if (!args.tenantId) {
      throw new BadRequestException(this.i18n.t('tenant.TENANT_ID_NOT_EMPTY'));
    }

    const [module, existingPerm] = await Promise.all([
      this.moduleService.getByKey(args.module, args.tenantId),
      this.modulePermService.getPermission(args.key, args.module, args.tenantId)
    ]);

    if (!module) {
      throw new BadRequestException(this.i18n.t('system.MODULE_NOT_EXIST', { args: { name: args.module } }));
    }

    if (existingPerm) {
      throw new BadRequestException(this.i18n.t('system.PERM_KEY_EXISTS', { args: { key: args.key } }));
    }

    const dto: CreateModulePermDto = {
      key: args.key,
      name: args.name,
      restrictLevel: args.restrictLevel,
      moduleId: module.id,
      tenantId: args.tenantId,
    };

    const modulePerm = await this.modulePermService.createPermission(dto);
    await this.modulePermService.appendModulePermissions(module, [modulePerm]);
    return true;
  }

  async update(args: UpdateModulePermArgs): Promise<boolean> {
    this.validateModule(args.module);

    if (!args.tenantId) {
      throw new BadRequestException(this.i18n.t('tenant.TENANT_ID_NOT_EMPTY'));
    }

    const [module, modulePerm] = await Promise.all([
      this.moduleService.getByKey(args.module, args.tenantId),
      this.modulePermService.getModulePermission(args.module, args.key, args.tenantId)
    ]);

    this.validatePermission(module, modulePerm);

    const dto: UpdateModulePermDto = {
      module: args.module,
      key: args.key,
      name: args.name,
      restrictLevel: args.restrictLevel,
      tenantId: args.tenantId,
    };
    await this.modulePermService.updatePermission(dto);
    return true;
  }

  async delete(args: DeleteModulePermArgs): Promise<boolean> {
    this.validateModule(args.module);

    if (!args.tenantId) {
      throw new BadRequestException(this.i18n.t('tenant.TENANT_ID_NOT_EMPTY'));
    }

    if (!args.key?.trim()) {
      throw new BadRequestException(this.i18n.t('system.PERM_KEY_NOT_EMPTY'))
    }

    const [module, modulePerm] = await Promise.all([
      this.moduleService.getByKey(args.module, args.tenantId),
      this.modulePermService.getModulePermission(args.module, args.key, args.tenantId)
    ]);

    this.validatePermission(module, modulePerm);

    if (module && modulePerm) {
      await this.modulePermService.removePermissionsFromModule(module, [modulePerm]);
    }
    return true;
  }

  // === 私有辅助方法 ===

  /**
   * 验证模块参数
   * @throws BadRequestException 当模块为空时
   */
  private validateModule(moduleKey: string): void {
    if (!moduleKey?.trim()) {
      throw new BadRequestException(this.i18n.t('system.MODULE_KEY_NOT_EMPTY'))
    }
  }

  /**
   * 验证权限归属
   * @throws NotFoundException 当模块或权限不存在时
   * @throws ForbiddenException 当无权限操作时
   */
  private validatePermission(module: ModuleEntity | null, permission: ModulePermEntity | null): void {
    if (!module) {
      throw new BadRequestException(this.i18n.t('system.MODULE_NOT_EXIST'));
    }
    if (!permission) {
      throw new BadRequestException(this.i18n.t('system.PERM_NOT_EXIST'));
    }
  }
}