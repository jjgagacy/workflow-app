import { Global, Module } from "@nestjs/common";
import { TenantCreatedEvent, TenantUpdatedEvent } from "./tenant.event";
import { TenantListener } from "./listeners/tenant.listener";

@Global()
@Module({
    imports: [],
    providers: [
        TenantListener,
    ],
    exports: [
        TenantListener,
    ],
})
export class EventModule { }
