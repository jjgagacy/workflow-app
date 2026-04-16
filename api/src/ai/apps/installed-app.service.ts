import { InstalledAppEntity } from "@/account/entities/installed-app.entity";
import { Transactional } from "@/common/decorators/transaction.decorator";
import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { DataSource, EntityManager, Repository } from "typeorm";
import { CreateInstalledAppDto } from "./dto/installed-app.dto";
import { validateDto } from "@/common/utils/validation";
import { checkEntityCreatedId } from "@/common/database/utils/validate";
import { I18nService } from "nestjs-i18n";
import { I18nTranslations } from "@/generated/i18n.generated";

@Injectable()
export class InstalledAppService {
  constructor(
    @InjectRepository(InstalledAppEntity)
    private readonly installedAppRepository: Repository<InstalledAppEntity>,
    private readonly i18n: I18nService<I18nTranslations>,
    private readonly dataSource: DataSource,
  ) { }

  @Transactional()
  async createInstalledApp(installedAppData: CreateInstalledAppDto, entityManager?: EntityManager): Promise<InstalledAppEntity> {
    const installedAppRepository = entityManager ? entityManager.getRepository(InstalledAppEntity) : this.installedAppRepository;
    const dtoInstance = await validateDto(CreateInstalledAppDto, installedAppData);

    const installedApp = this.installedAppRepository.create({
      tenant: { id: dtoInstance.tenantId },
      ownerTenantId: dtoInstance.ownerTenantId,
      app: { id: dtoInstance.appId },
      createdAt: dtoInstance.createdAt || new Date(),
    });
    await installedAppRepository.save(installedApp);
    checkEntityCreatedId(installedApp, this.i18n);
    return installedApp;
  }
}