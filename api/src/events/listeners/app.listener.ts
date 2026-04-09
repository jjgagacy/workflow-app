import { Injectable } from "@nestjs/common";
import { OnEvent } from "@nestjs/event-emitter";

@Injectable()
export class AppListener {
  @OnEvent('app.created')
  handleAppCreatedEvent(event: any) {
    // 处理应用创建事件，例如记录日志、发送通知等
    console.log(`App created with ID: ${event.appId} for Tenant: ${event.tenantId}`);
  }
}