export class AppCreatedEvent {
  constructor(
    public appId: string,
    public tenantId: string,
  ) { }
}