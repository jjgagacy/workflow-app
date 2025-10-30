import { Injectable } from "@nestjs/common";
import { OnEvent } from "@nestjs/event-emitter";
import { TenantCreatedEvent, TenantUpdatedEvent } from "../tenant.event";

@Injectable()
export class TenantListener {
    @OnEvent('tenant.created')
    handleTenantCreatedEvent(event: TenantCreatedEvent) {

    }

    @OnEvent('tenant.updated')
    handleTenantUpdatedEvent(event: TenantUpdatedEvent) {

    }
}