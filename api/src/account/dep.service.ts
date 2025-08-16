import { BadRequestException, Injectable } from "@nestjs/common";
import { DepEntity } from "./entities/dep.entity";
import { EntityManager, FindManyOptions, FindOptionsWhere, In, Not, QueryRunner, Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";
import { errorObject } from "src/common/types/errors/error";
import { QueryDepDto } from "./dep/dto/query-dep.dto";
import { DepInterface } from "./interfaces/dep.interface";
import { AccountService } from "src/account/account.service";
import { CreateDepDto } from "./dep/dto/create-dep.dto";
import { UpdateDepDto } from "./dep/dto/update-dep.dto";

@Injectable()
export class DepService {
    constructor(
        @InjectRepository(DepEntity)
        private readonly depRepository: Repository<DepEntity>,
        private readonly accountService: AccountService
    ) {}

    async getByKey(key: string): Promise<DepEntity | null> {
        return await this.depRepository.findOneBy({ key });
    }

    async getManager(id: number): Promise<number | null> {
        const dep = await this.depRepository.findOne({
            where: { id },
        });
        if (!dep) return null;
        return dep.managerId;
    }

    async create(dto: CreateDepDto): Promise<DepEntity> {
        const validateObj = plainToInstance(CreateDepDto, dto);
        const errors = await validate(validateObj);
        if (errors.length > 0) {
            throw new BadRequestException(errorObject("DTO验证失败", { key: errors.toString }));
        }
        const [existingByKey] = await Promise.all([
            this.depRepository.findOneBy({ key: dto.key }),
            this.validateNameUnique(dto),
        ]);
        if (existingByKey) {
            throw new BadRequestException(
                errorObject('key不能重复', { key: dto.key }),
            );
        }
        const newDep = this.depRepository.create({
            key: dto.key,
            name: dto.name,
            parent: dto.parent,
            remarks: dto.remarks,
            ...(dto.managerId !== undefined && { managerId: dto.managerId })
        });

        return this.depRepository.save(newDep); // 直接返回 Promise
    }

    private async validateNameUnique(dto: { parent?: string; name?: string }, excludeKey?: string) {
        if (!dto.name) return; // 如果没传name则不检查

        const where: any = {
            parent: dto.parent || '', // 统一处理空parent
            name: dto.name
        };

        if (excludeKey) {
            where.key = Not(excludeKey); // 排除自身（用于update场景）
        }

        const existing = await this.depRepository.findOneBy(where);
        if (existing) {
            throw new BadRequestException(errorObject(`同parent下name已存在`, { key: dto.name, key2: dto.name }));
        }
    }

    async update(dto: UpdateDepDto): Promise<DepEntity | null> {
        const validateObj = plainToInstance(UpdateDepDto, dto);
        const errors = await validate(validateObj);
        if (errors.length > 0) {
            throw new BadRequestException(errorObject('DTO验证失败', { key: errors.toString() }));
        }
        const dep = await this.depRepository.findOneBy({ key: dto.key });
        if (!dep) {
            throw new BadRequestException(errorObject('部门key不存在', { key: dto.key }));
        }
        if (dto.parent && dto.name) {
            await this.validateNameUnique(dto, dto.key);
        }

        const updated: Record<string, any> = { ...dep };
        const keys: Array<keyof UpdateDepDto> = ['name', 'parent', 'remarks', 'managerId'];
        keys.forEach(key => {
            if (dto[key] !== undefined) {
                updated[key] = dto[key] ?? dep[key];
            }
        });
        return this.depRepository.save(updated);
    }

    async deleteDepChildren(parentKey: string, manager: EntityManager) {
        if (!parentKey) return;

        // 一次性获取所有子部门（包括嵌套层级）
        const children = await manager.find(DepEntity, {
            where: { parent: parentKey }
        });

        // 并行删除所有子部门（使用delete比remove更高效）
        await Promise.all(
            children.map(child =>
                this.deleteDepAndChildTree(child.key, manager)
            )
        );
    }

    async deleteDepAndChildTree(depKey: string, manager: EntityManager) {
        // 先递归删除子部门
        await this.deleteDepChildren(depKey, manager);
        // 再删除当前部门
        await manager.delete(DepEntity, { key: depKey });
    }

    async deleteByIds(ids: number[], queryRunner?: QueryRunner): Promise<void> {
        const repository = queryRunner
            ? queryRunner.manager.getRepository(DepEntity)
            : this.depRepository;

        if (!ids || ids.length === 0) {
            throw new BadRequestException(errorObject('必须提供有效的ID数组'));
        }

        const existingDeps = await repository.find({
            where: { id: In(ids) },
            select: ['id', 'key']
        });

        if (existingDeps.length !== ids.length) {
            const missingIds = ids.filter(id =>
                !existingDeps.some(dep => dep.id === id)
            );
            throw new BadRequestException(errorObject("以下ID不存在", { key:  missingIds.join(',') }));
        }

        await repository.manager.transaction(
            async (manager) => {
                // 并行处理所有部门
                await Promise.all(
                    existingDeps.map(dep => 
                        this.deleteDepAndChildTree(dep.key, manager)
                    )
                )
            }
        );
    }

    async query(queryParams: Partial<QueryDepDto> | GetDepArgs): Promise<{ data: DepEntity[]; total: number }> {
        const dto = new QueryDepDto();

        if (queryParams instanceof QueryDepDto) {
            Object.assign(dto, queryParams);
        } else {
            dto.setQueryArgs(queryParams as GetDepArgs);
        }
        // 1. 构建查询条件
        const where: FindOptionsWhere<DepEntity> = {
            ...(dto.key !== undefined && { key: dto.key }),
            ...(dto.name !== undefined && { key: dto.name }),
            ...(dto.parent !== undefined && { key: dto.parent }),
        }
        // 2. 构建排序条件
        const order = dto.order ? { ...dto.order } : {};
        // 构建查询选项
        const options: FindManyOptions<DepEntity> = {
            where,
            order
        };

        // 执行查询
        if (dto.paginate) {
            const [data, total] = await this.depRepository.findAndCount(options);
            return { data, total };
        } else {
            const data = await this.depRepository.find(options);
            return { data, total: data.length };
        }
    }

    async getDeps(): Promise<DepInterface[]> {
        // 1. 查询所有部门
        const { data: deps } = await this.query(new QueryDepDto());

        // 2. 创建部门映射表并初始化子部门数组
        const depMap = new Map<string, DepInterface>();
        deps.forEach(dep => {
            depMap.set(dep.key, {
                ...dep,
                children: [],
                manager: undefined
            });
        });

        // 3. 并行获取所有部门的管理者信息
        const managerPromises = Array.from(depMap.values()).map(async depNode => {
            const dep = await this.getByKey(depNode.key);
            if (!dep?.id) return { depKey: null };
            const manager = await this.getManager(dep.id);
            if (!manager) return { depKey: depNode.key };
            const account = await this.accountService.getById(manager);
            return { depKey: depNode.key, account };
        });

        const managerResults = await Promise.all(managerPromises);

        // 4. 更新部门管理者信息
        managerResults.forEach(({ depKey, account }) => {
            if (!depKey) return;
            const depNode = depMap.get(depKey);
            if (depNode && account) {
                depNode.manager = {
                    id: account.id,
                    username: account.username,
                    realName: account.realName,
                    mobile: account.mobile
                };
            }
        });

        // 5. 构建部门树
        const tree: DepInterface[] = [];
        depMap.forEach(depNode => {
            if (!depNode.parent) {
                tree.push(depNode);
            } else {
                const parent = depMap.get(depNode.parent);
                if (parent && parent.children) parent.children.push(depNode);
            }
        });

        return tree;
    }
}