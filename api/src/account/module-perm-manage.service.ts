import { BadRequestException, Injectable } from "@nestjs/common";
import { errorObject } from "src/common/types/errors/error";
import { ModuleEntity } from "./entities/module.entity";
import { ModulePermEntity } from "./entities/module-perm.entity";
import { ModuleService } from "./module.service";
import { ModulePermService } from "./module-perm.service";
import { CreateModulePermDto } from "./perm/dto/create-module-perm.dto";
import { UpdateModulePermDto } from "./perm/dto/update-module-perm.dto";

@Injectable()
export class ModulePermManageService {
    constructor(
        private readonly moduleService: ModuleService,
        private readonly modulePermService: ModulePermService,
    ) {}

    /**
     * 创建权限
     * @param args 
     */
    async create(args: CreateModulePermArgs): Promise<boolean> {
        this.validateModule(args.module);

        const [module, existingPerm] = await Promise.all([
            this.moduleService.getByKey(args.module),
            this.modulePermService.getPermission(args.key, args.module)
        ]);

        if (!module) {
            throw new BadRequestException(errorObject(`模块不存在`, { key: args.module }));
        }

        if (existingPerm) {
            throw new BadRequestException(errorObject(`权限已存在`, { key: args.key }));
        }

        const dto: CreateModulePermDto = {
            key: args.key,
            name: args.name,
            restrictLevel: args.restrictLevel,
            moduleId: module.id
        };

        const modulePerm = await this.modulePermService.createPermission(dto);
        await this.modulePermService.appendModulePermissions(module, [modulePerm]);
        return true;
    }

    async update(args: UpdateModulePermArgs): Promise<boolean> {
        this.validateModule(args.module);

        const [module, modulePerm] = await Promise.all([
            this.moduleService.getByKey(args.module),
            this.modulePermService.getModulePermission(args.module, args.key)
        ]);

        this.validatePermission(module, modulePerm);

        const dto: UpdateModulePermDto = {
            module: args.module,
            key: args.key,
            name: args.name,
            restrictLevel: args.restrictLevel
        };

        await this.modulePermService.updatePermission(dto);
        return true;
    }

    async delete(args: DeleteModulePermArgs): Promise<boolean> {
        this.validateModule(args.module);

        if (!args.key?.trim()) {
            throw new BadRequestException(errorObject('权限key不能为空'));
        }

        const [module, modulePerm] = await Promise.all([
            this.moduleService.getByKey(args.module),
            this.modulePermService.getModulePermission(args.module, args.key)
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
            throw new BadRequestException(errorObject('模块key不能为空', { key: moduleKey }));
        }
    }

    /**
     * 验证权限归属
     * @throws NotFoundException 当模块或权限不存在时
     * @throws ForbiddenException 当无权限操作时
     */
    private validatePermission(module: ModuleEntity | null, permission: ModulePermEntity | null): void {
        if (!module) {
            throw new BadRequestException(errorObject('模块不存在'));
        }

        if (!permission) {
            throw new BadRequestException(errorObject('权限不存在'));
        }
    }
}