import { Global, Module } from "@nestjs/common";
import { TenantCreatedEvent, TenantUpdatedEvent } from "./tenant.event";
import { TenantListener } from "./listeners/tenant.listener";
import { AppListener } from "./listeners/app.listener";
import { AppsModule } from "@/ai/apps/apps.module";
import { InstalledAppService } from "@/ai/apps/installed-app.service";

@Global()
@Module({
  imports: [AppsModule],
  providers: [
    TenantListener,
    AppListener,
    InstalledAppService
  ],
  exports: [
    TenantListener,
  ],
})
export class EventModule { }
