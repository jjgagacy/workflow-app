import { InstalledAppEntity } from "@/account/entities/installed-app.entity";
import { CreateInstalledAppDto } from "@/ai/apps/dto/installed-app.dto";
import { InstalledAppService } from "@/ai/apps/installed-app.service";
import { Injectable } from "@nestjs/common";
import { OnEvent } from "@nestjs/event-emitter";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

@Injectable()
export class AppListener {
  constructor(
    @InjectRepository(InstalledAppEntity)
    private readonly installedAppRepository: Repository<InstalledAppEntity>,
    private readonly installedAppService: InstalledAppService
  ) { }

  @OnEvent('app.created')
  handleAppCreatedEvent(event: any) {
    // 处理应用创建事件，例如记录日志、发送通知等
    const installedAppDto = new CreateInstalledAppDto();
    installedAppDto.appId = event.appId;
    installedAppDto.ownerTenantId = event.tenantId;
    installedAppDto.tenantId = event.tenantId;
    this.installedAppService.createInstalledApp(installedAppDto);
  }
}