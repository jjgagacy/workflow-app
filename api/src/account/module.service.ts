import { BadRequestException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { ModuleEntity } from "./entities/module.entity";
import { FindManyOptions, FindOptionsRelations, FindOptionsWhere, Not, QueryRunner, Repository } from "typeorm";
import { QueryModuleDto } from "./module/dto/query-module.dto";
import { ModulePermEntity } from "./entities/module-perm.entity";
import { CreateModuleDto } from "./module/dto/create-module.dto";
import { UpdateModuleDto } from "./module/dto/update-module.dto";
import { I18nService } from "nestjs-i18n";
import { I18nTranslations } from "@/generated/i18n.generated";
import { validateDto } from "@/common/utils/validation";
import { isPaginator } from "@/common/database/utils/pagination";
import { getPaginationOptions } from "@/common/database/dto/query.dto";

@Injectable()
export class ModuleService {
  constructor(
    @InjectRepository(ModuleEntity)
    private readonly moduleRepository: Repository<ModuleEntity>,
    private readonly i18n: I18nService<I18nTranslations>,
  ) { }

  async getById(id: number, relations?: FindOptionsRelations<ModuleEntity>): Promise<ModuleEntity | null> {
    return await this.moduleRepository.findOne({ where: { id }, relations });
  }

  async getByKey(key: string, tenantId: string, relations?: FindOptionsRelations<ModuleEntity>): Promise<ModuleEntity | null> {
    return await this.moduleRepository.findOne({ where: { key, tenant: { id: tenantId } }, relations });
  }

  async create(dto: CreateModuleDto): Promise<ModuleEntity> {
    await validateDto(CreateModuleDto, dto, this.i18n);

    const existingModule = await this.getByKey(dto.key, dto.tenantId);
    if (existingModule) {
      throw new BadRequestException(this.i18n.t('system.KEY_DUPLICATE', { args: { key: dto.key } }));
    }
    const moduleEntity = this.moduleRepository.create({
      key: dto.key,
      name: dto.name,
      tenant: { id: dto.tenantId }
    });
    await this.moduleRepository.save(moduleEntity);
    return moduleEntity;
  }

  async update(dto: UpdateModuleDto): Promise<ModuleEntity> {
    await validateDto(UpdateModuleDto, dto, this.i18n);

    const module = await this.getById(dto.id, { tenant: true });
    if (!module || module.tenant.id != dto.tenantId) {
      throw new BadRequestException(this.i18n.t('system.MODULE_NOT_EXIST', { args: { name: dto.id } }));
    }
    const existingKeyModule = await this.moduleRepository.findOneBy({
      key: dto.key,
      id: Not(dto.id),
      tenant: { id: dto.tenantId }
    });
    if (existingKeyModule) {
      throw new BadRequestException(this.i18n.t('system.KEY_DUPLICATE', { args: { key: dto.key } }));
    }

    Object.assign(module, {
      key: dto.key ?? module.key,
      name: dto.name ?? module.name
    });
    return this.moduleRepository.save(module);
  }

  async deleteByIds(ids: number[], tenantId: string, queryRunnder?: QueryRunner): Promise<void> {
    const repository = queryRunnder
      ? queryRunnder.manager.getRepository(ModuleEntity)
      : this.moduleRepository;

    if (!ids || ids.length === 0) {
      throw new BadRequestException(this.i18n.t('system.ID_NOT_EXIST', { args: { id: '' } }));
    }

    await repository.manager.transaction(
      async (manager) => {
        await manager.delete(ModuleEntity, { id: ids, tenantId });
      }
    );
  }

  async query(queryParams: Partial<QueryModuleDto> | GetModuleListArgs): Promise<{ data: ModuleEntity[]; total: number }> {
    const dto = new QueryModuleDto();

    if (queryParams instanceof QueryModuleDto) {
      Object.assign(dto, queryParams);
    } else {
      dto.setQueryArgs(queryParams as GetModuleListArgs);
    }

    // 1. 构建查询条件
    const where: FindOptionsWhere<ModuleEntity> = {
      ...(dto.key !== undefined && { key: dto.key }),
      ...(dto.name !== undefined && { name: dto.name }),
      ...(dto.tenantId !== undefined && { tenant: { id: dto.tenantId } }),
    }

    // 2. 构建排序条件
    const order = dto.order ? { ...dto.order } : {};
    // 构建查询选项
    const options: FindManyOptions<ModuleEntity> = {
      where,
      order,
      ...(dto.relations && { relations: dto.relations }),
      ...(getPaginationOptions(dto))
    };

    // 执行查询
    if (isPaginator(dto)) {
      const [data, total] = await this.moduleRepository.findAndCount(options);
      return { data, total };
    } else {
      const data = await this.moduleRepository.find(options);
      return { data, total: data.length };
    }
  }

  /**
   * 获取权限组的权限列表
   * @param id 
   * @returns 
   */
  async getModulePerms(id: number | string, tenantId: string): Promise<ModulePermEntity[] | null> {
    const where: FindOptionsWhere<ModuleEntity> = typeof (id) === 'number' ? { id, tenant: { id: tenantId } } : { key: id, tenant: { id: tenantId } };
    const module = await this.moduleRepository.findOne({
      where,
      relations: { perms: true },
      select: ['id'] // 仅查询必要字段
    });
    // 2. 明确返回 null 类型
    return module?.perms || null;
  }

}
