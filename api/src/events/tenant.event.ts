import { Injectable } from "@nestjs/common";

export class TenantCreatedEvent {
    constructor(public tenantId: string) { }
}

export class TenantUpdatedEvent {
    constructor(public tenantId: string) { }
}
