import { UploadFilesEntity } from "@/account/entities/upload-files.entity";
import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { FindManyOptions, FindOptionsOrder, FindOptionsWhere, Like, Repository } from "typeorm";
import { CommonUploadFileDto, CreateUploadFileDto, QueryUploadFileDto } from "./dto/file.dto";
import { getPaginationOptions } from "@/common/database/dto/query.dto";
import { isPaginator } from "@/common/database/utils/pagination";
import { I18nService } from "nestjs-i18n";
import { validateDto } from "@/common/utils/validation";

@Injectable()
export class UploadFileService {
  constructor(
    @InjectRepository(UploadFilesEntity)
    private readonly uploadFilesRepository: Repository<UploadFilesEntity>,
    private readonly i18n: I18nService,
  ) { }

  async create(dto: CreateUploadFileDto): Promise<UploadFilesEntity> {
    const uploadFilesRepository = this.uploadFilesRepository;
    const dtoInstance = await validateDto(CreateUploadFileDto, dto, this.i18n);

    const uploadFilesEntity = uploadFilesRepository.create({
      ...this.mapUploadFilesBaseFields(dtoInstance),
      createdRole: dto.createdRole as string,
      ...(dto.createdAccount !== undefined && { createdAccount: { id: dto.createdAccount } }),
      ...(dto.createdUser !== undefined && { createdUser: dto.createdUser }),
      createdAt: new Date(),
    });
    return await this.uploadFilesRepository.save(uploadFilesEntity);
  }

  async save(uploadFilesEntity: UploadFilesEntity) {
    await this.uploadFilesRepository.save(uploadFilesEntity);
  }

  private mapUploadFilesBaseFields(dto: CommonUploadFileDto) {
    return {
      key: dto.key,
      tenant: { id: dto.tenantId },
      storageType: dto.storageType as string,
      name: dto.name,
      size: dto.size,
      extension: dto.extension,
      mimeType: dto.mimeType,
      hash: dto.hash,
      sourceUrl: dto.sourceUrl,
    };
  }

  async findById(id: string): Promise<UploadFilesEntity | null> {
    return await this.uploadFilesRepository.findOne({
      where: { id },
    });
  }

  async findByIdAndTenant(id: string, tenantId: string): Promise<UploadFilesEntity | null> {
    return await this.uploadFilesRepository.findOne({
      where: { id, tenant: { id: tenantId } },
    });
  }

  async findByKey(key: string, tenantId: string): Promise<UploadFilesEntity | null> {
    return await this.uploadFilesRepository.findOne({
      where: { key, tenant: { id: tenantId } },
    });
  }

  async query(queryParams: Partial<QueryUploadFileDto>): Promise<{ data: UploadFilesEntity[], total: number }> {
    const dto = new QueryUploadFileDto();
    Object.assign(dto, queryParams);

    const where: FindOptionsWhere<UploadFilesEntity> = {
      ...(dto.tenantId !== undefined && { tenant: { id: dto.tenantId } }),
      ...(dto.storageType !== undefined && { storageType: dto.storageType }),
      ...(dto.createdAccount !== undefined && { createdAccount: { id: dto.createdAccount } }),
      ...(dto.createdRole !== undefined && { createdRole: dto.createdRole }),
      ...(dto.createdUser !== undefined && { createdUser: dto.createdUser }),
      ...(dto.key !== undefined && { key: dto.key }),
      ...(dto.mimeType !== undefined && { mimeType: dto.mimeType }),
      ...(dto.name !== undefined && { name: Like(`%{dto.name}%`) }),
    };

    const order: FindOptionsOrder<UploadFilesEntity> = { ...dto.order };
    const options: FindManyOptions<UploadFilesEntity> = {
      where,
      order,
      ...(dto.relations && { relations: dto.relations }),
      ...(getPaginationOptions(dto))
    };

    if (isPaginator(dto)) {
      const [data, total] = await this.uploadFilesRepository.findAndCount(options);
      return { data, total };
    } else {
      const data = await this.uploadFilesRepository.find(options);
      return { data, total: data.length };
    }
  }
}
