import { CreateAccountDto } from "@/account/account/dto/create-account.dto";
import { AppEntity } from "@/account/entities/app.entity";
import { CreateAppDto, QueryAppDto } from "@/ai/apps/dto/app.dto";
import { AppMode } from "@/ai/apps/types/app.type";
import { getPaginationOptions } from "@/common/database/dto/query.dto";
import { isPaginator } from "@/common/database/utils/pagination";
import { checkEntityCreatedId } from "@/common/database/utils/validate";
import { Transactional } from "@/common/decorators/transaction.decorator";
import { EnumUtils } from "@/common/utils/enums";
import { validateDto } from "@/common/utils/validation";
import { I18nTranslations } from "@/generated/i18n.generated";
import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { I18nService } from "nestjs-i18n";
import { DataSource, EntityManager, FindManyOptions, FindOptionsOrder, FindOptionsWhere, Like, Repository } from "typeorm";

@Injectable()
export class AppsService {
  constructor(
    @InjectRepository(AppEntity)
    private readonly appRepository: Repository<AppEntity>,
    private readonly dataSource: DataSource,
    private readonly i18n: I18nService<I18nTranslations>,
  ) { }

  async query(queryParams: Partial<QueryAppDto> | GetAppListArgs) {
    const queryDto = new QueryAppDto();
    if (queryParams instanceof QueryAppDto) {
      Object.assign(queryDto, queryParams);
    } else {
      queryDto.setQueryArgs(queryParams as GetAppListArgs);
    }

    const where: FindOptionsWhere<AppEntity> = {
      tenant: { id: queryDto.tenantId },
      ...(queryDto.accountId && { accountId: queryDto.accountId }),
      ...(queryDto.name && { name: Like(`%${queryDto.name}%`) }),
      ...(queryDto.mode && { mode: queryDto.mode }),
      ...(typeof queryDto.isPublic === 'boolean' && { isPublic: queryDto.isPublic }),
    };
    const order: FindOptionsOrder<AppEntity> = queryDto.order || { id: 'DESC' };
    const options: FindManyOptions<AppEntity> = {
      where,
      order,
      ...getPaginationOptions(queryDto),
    };

    if (isPaginator(queryDto)) {
      const [data, total] = await this.appRepository.findAndCount(options);
      return { data, total };
    } else {
      const data = await this.appRepository.find(options);
      return { data, total: data.length };
    }
  }

  @Transactional()
  async createApp(dto: CreateAppDto, entityManager?: EntityManager): Promise<AppEntity> {
    const appRepository = entityManager ? entityManager.getRepository(AppEntity) : this.appRepository;

    const dtoInstance = await validateDto(CreateAppDto, dto, this.i18n);

    const appEntity = appRepository.create({
      tenant: { id: dtoInstance.tenantId },
      accountId: dtoInstance.accountId,
      name: dtoInstance.name,
      mode: dtoInstance.mode as string,
      ...this.mapBaseFields(dtoInstance),
      operate: {
        createdAt: dtoInstance.createdAt || new Date(),
        createdBy: dtoInstance.createdBy,
      },
    });

    await appRepository.save(appEntity);
    checkEntityCreatedId(appEntity, this.i18n);
    return appEntity;
  }

  validateAppMode(mode: string): void {
    EnumUtils.isEnumValue(AppMode, mode);
  }

  private mapBaseFields(dto: CreateAppDto) {
    const { description, icon, enableSite, enableApi, isPublic, workflowId } = dto;
    return {
      ...('description' in dto && { description }),
      ...('icon' in dto && { icon }),
      ...('enableSite' in dto && { enableSite }),
      ...('enableApi' in dto && { enableApi }),
      ...('isPublic' in dto && { isPublic }),
      ...('workflowId' in dto && { workflowId }),
    };
  }
}