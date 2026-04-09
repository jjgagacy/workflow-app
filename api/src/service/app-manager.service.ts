import { AccountEntity } from "@/account/entities/account.entity";
import { AppsService } from "@/ai/apps/apps.service";
import { CreateAppDto } from "@/ai/apps/dto/app.dto";
import { defaultAppTemplate, getAppTemplate } from "@/ai/apps/entities/default-app-template";
import { AppMode } from "@/ai/apps/types/app.type";
import { Transactional } from "@/common/decorators/transaction.decorator";
import { EnumConverter } from "@/common/utils/enums";
import { AppCreatedEvent } from "@/events/app.event";
import { CreateAppInput } from "@/graphql/app/types/app-input.type";
import { Injectable } from "@nestjs/common";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { DataSource, EntityManager } from "typeorm";

@Injectable()
export class AppManagerService {

  constructor(
    private readonly dataSource: DataSource,
    private readonly appsService: AppsService,
    private readonly eventEmitter: EventEmitter2,
  ) { }

  @Transactional()
  async createApp(tenantId: string, input: CreateAppInput, account: AccountEntity, entityManager?: EntityManager) {
    const workManager = entityManager || this.dataSource.manager;
    const createAppDto = new CreateAppDto();
    const mode = EnumConverter.toEnum(AppMode, input.mode);
    const appTemplate = getAppTemplate(mode);
    Object.assign(createAppDto, input, appTemplate.app, {
      tenantId,
      accountId: account.id,
      createdBy: account.username,
      mode,
    });

    const app = await this.appsService.createApp(createAppDto, workManager);

    // todo: model config

    // event dispatch
    const event = new AppCreatedEvent(app.id, tenantId);
    this.eventEmitter.emit('app.created', event);

    return app;
  }
}