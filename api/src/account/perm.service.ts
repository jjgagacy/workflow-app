import { BadRequestException, Injectable } from "@nestjs/common";
import { PermEntity } from "./entities/perm.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { FindManyOptions, FindOptionsOrder, FindOptionsWhere, Repository } from "typeorm";
import { CreatePermDto } from "./perm/dto/create-perm.dto";
import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";
import { errorObject } from "src/common/types/errors/error";
import { QueryPermDto } from "./perm/dto/query-perm.dto";
import { UpdatePermDto } from "./perm/dto/update-perm.dto";

@Injectable()
export class PermService {
    constructor(
        @InjectRepository(PermEntity)
        private readonly permRepository: Repository<PermEntity>
    ) {}

    /**
     * 获取权限等级
     * @param key - 权限等级key
     * @returns 权限等级实体或null
     */
    async getByKey(key: string): Promise<PermEntity | null> {
        return this.permRepository.findOneBy({ key });
    }

    /**
     * 创建权限等级
     * @param dto - 创建DTO
     * @returns 新创建的权限等级
     * @throws BadRequestException 当DTO验证失败或key已存在时
     */
    async create(dto: CreatePermDto): Promise<PermEntity> {
        const validateObj = plainToInstance(CreatePermDto, dto);
        const errors = await validate(validateObj);
        if (errors.length > 0) {
            throw new BadRequestException(
                errorObject('DTO验证错误', { key: errors.toString() }),
            );
        }

        if (await this.getByKey(dto.key)) {
            throw new BadRequestException(errorObject(`权限等级key已存在`, { key: dto.key }));
        }

        return this.permRepository.save(
            this.permRepository.create({
                key: dto.key,
                name: dto.name,
                level: dto.level,
            }),
        );
    }

    /**
     * 更新权限等级
     * @param dto - 更新DTO
     * @returns 更新后的权限等级
     * @throws BadRequestException 当权限等级不存在时
     */
    async update(dto: UpdatePermDto): Promise<PermEntity> {
        const validateObj = plainToInstance(UpdatePermDto, dto);
        const errors = await validate(validateObj);
        if (errors.length > 0) {
            throw new BadRequestException(
                errorObject('DTO验证错误', { details: errors.toString() }),
            );
        }

        const permLevel = await this.getByKey(dto.key);
        if (!permLevel) {
            throw new BadRequestException(errorObject(`权限等级不存在`, { key: dto.key }));
        }

        return this.permRepository.save({
            ...permLevel,
            name: dto.name ?? permLevel.name,
            level: dto.level ?? permLevel.level,
        });
    }

    /**
     * 删除权限等级
     * @param key - 要删除的权限等级key
     * @throws BadRequestException 当权限等级不存在时
     */
    async delete(key: string): Promise<void> {
        const permLevel = await this.getByKey(key);
        if (!permLevel) {
            throw new BadRequestException(errorObject(`权限等级不存在`, { key }));
        }
        await this.permRepository.remove(permLevel);
    }

    /**
     * 查询权限等级列表
     * @param dto - 查询DTO
     * @returns 包含数据和总数的对象
     */
    async query(dto: QueryPermDto): Promise<{data: PermEntity[];total: number}> {
        const where: FindOptionsWhere<PermEntity> = {
            ...(dto.key && { key: dto.key }),
            ...(dto.name && { name: dto.name }),
        };
        // 构建排序
        const order: FindOptionsOrder<PermEntity> = { ...dto.order };
        // 构建查询选项
        const options: FindManyOptions<PermEntity> = {
            where,
            order: dto.order ? { ...dto.order } : undefined,
            ...(dto.paginate && {
                skip: dto.skip ?? 0,
                take: dto.limit ?? 10,
            }),
        }
        // 执行查询
        if (dto.paginate) {
            const [data, total] = await this.permRepository.findAndCount(options);
            return { data, total };
        } else {
            const data = await this.permRepository.find(options);
            return { data, total: data.length };
        }
    }

}