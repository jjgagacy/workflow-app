import { BadRequestException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { ModuleEntity } from "./entities/module.entity";
import { FindManyOptions, FindOptionsWhere, Not, QueryRunner, Repository } from "typeorm";
import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";
import { errorObject } from "src/common/types/errors/error";
import { QueryModuleDto } from "./module/dto/query-module.dto";
import { ModulePermEntity } from "./entities/module-perm.entity";
import { CreateModuleDto } from "./module/dto/create-module.dto";
import { UpdateModuleDto } from "./module/dto/update-module.dto";

@Injectable()
export class ModuleService {
    constructor(
        @InjectRepository(ModuleEntity)
        private readonly moduleRepository: Repository<ModuleEntity>
    ) {}

    async getById(id: number): Promise<ModuleEntity | null> {
        return await this.moduleRepository.findOneBy({ id });
    }

    async getByKey(key: string): Promise<ModuleEntity | null> {
        return await this.moduleRepository.findOneBy({ key });
    }

    async create(dto: CreateModuleDto): Promise<ModuleEntity> {
        const validateObj = plainToInstance(CreateModuleDto, dto);
        const errors = await validate(validateObj);
        if (errors.length > 0) {
            throw new BadRequestException(
                errorObject('DTO验证失败', { key: errors.toString() }),
            );
        }
        const existingModule = await this.getByKey(dto.key);
        if (existingModule) {
            throw new BadRequestException(
                errorObject('key不能重复', { key: dto.key }),
            );
        }
        const moduleEntity = this.moduleRepository.create({
            key: dto.key,
            name: dto.name
        });
        await this.moduleRepository.save(moduleEntity);
        return moduleEntity;
    }

    async update(dto: UpdateModuleDto): Promise<ModuleEntity> {
        const validateObj = plainToInstance(UpdateModuleDto, dto);
        const errors = await validate(validateObj);
        if (errors.length > 0) {
            throw new BadRequestException(
                errorObject('DTO验证失败', { key: errors.toString() }),
            );
        }
        const module = await this.getById(dto.id);
        if (!module) {
            throw new BadRequestException(
                errorObject('module不存在', { key: dto.id })
            );
        }
        const existingKeyModule = await this.moduleRepository.findOneBy({
            key: dto.key,
            id: Not(dto.id)
        });
        if (existingKeyModule) {
            throw new BadRequestException(
                errorObject('moduleKey已存在', { key: dto.key })
            );
        }

        Object.assign(module, {
            key: dto.key ?? module.key,
            name: dto.name ?? module.name
        });
        return this.moduleRepository.save(module);
    }

    async deleteByIds(ids: number[], queryRunnder?: QueryRunner): Promise<void> {
        const repository = queryRunnder
            ? queryRunnder.manager.getRepository(ModuleEntity)
            : this.moduleRepository;

        if (!ids || ids.length === 0) {
            throw new BadRequestException(errorObject('必须提供有效的ID数组'));
        }

        await repository.manager.transaction(
            async (manager) => {
                await manager.delete(ModuleEntity, ids);
            }
        );
    }

    async query(queryParams: Partial<QueryModuleDto> | GetModuleListArgs): Promise<{ data: ModuleEntity[]; total: number}> {
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
        }

        // 2. 构建排序条件
        const order = dto.order ? { ...dto.order } : {};
        // 构建查询选项
        const options: FindManyOptions<ModuleEntity> = {
            where,
            order,
            ...(dto.relations && { relations: dto.relations }),
            ...(dto.paginate && { skip: dto.skip || 0, take: dto.limit || 10 })
        };

        // 执行查询
        if (dto.paginate) {
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
    async getModulePerms(id: number | string): Promise<ModulePermEntity[] | null> {
        const where = typeof(id) === 'number' ? { id } : { key: id};
        const module = await this.moduleRepository.findOne({
            where,
            relations: { perms: true },
            select: ['id'] // 仅查询必要字段
        });
        // 2. 明确返回 null 类型
        return module?.perms || null;
    }

}