import { BadRequestException, Injectable } from "@nestjs/common";
import { PermEntity } from "./entities/perm.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { FindManyOptions, FindOptionsWhere, Repository } from "typeorm";
import { CreatePermDto } from "./perm/dto/create-perm.dto";
import { QueryPermDto } from "./perm/dto/query-perm.dto";
import { UpdatePermDto } from "./perm/dto/update-perm.dto";
import { I18nService } from "nestjs-i18n";
import { I18nTranslations } from "@/generated/i18n.generated";
import { validateDto } from "@/common/utils/validation";
import { getPaginationOptions } from "@/common/database/dto/query.dto";
import { isPaginator } from "@/common/database/utils/pagination";

@Injectable()
export class PermService {
  constructor(
    @InjectRepository(PermEntity)
    private readonly permRepository: Repository<PermEntity>,
    private readonly i18n: I18nService<I18nTranslations>,
  ) { }

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
    await validateDto(CreatePermDto, dto, this.i18n);

    if (await this.getByKey(dto.key)) {
      throw new BadRequestException(this.i18n.t('system.PERM_LEVEL_KEY_EXISTS', { args: { key: dto.key } }));
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
    await validateDto(UpdatePermDto, dto, this.i18n);

    const permLevel = await this.getByKey(dto.key);
    if (!permLevel) {
      throw new BadRequestException(this.i18n.t('system.PERM_KEY_NOT_EXISTS', { args: { key: dto.key } }));
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
      throw new BadRequestException(this.i18n.t('system.PERM_KEY_NOT_EXISTS', { args: { key } }));
    }
    await this.permRepository.remove(permLevel);
  }

  /**
   * 查询权限等级列表
   * @param dto - 查询DTO
   * @returns 包含数据和总数的对象
   */
  async query(dto: QueryPermDto): Promise<{ data: PermEntity[]; total: number }> {
    const where: FindOptionsWhere<PermEntity> = {
      ...(dto.key && { key: dto.key }),
      ...(dto.name && { name: dto.name }),
    };
    // 构建查询选项
    const options: FindManyOptions<PermEntity> = {
      where,
      order: dto.order ? { ...dto.order } : undefined,
      ...(getPaginationOptions(dto)),
    }
    // 执行查询
    if (isPaginator(dto)) {
      const [data, total] = await this.permRepository.findAndCount(options);
      return { data, total };
    } else {
      const data = await this.permRepository.find(options);
      return { data, total: data.length };
    }
  }

}