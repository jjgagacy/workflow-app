export class SubscriptionRequestDto {
  // 订阅计划类型： basic / premium / enterprise
  plan: string;
  // 订阅周期： monthly / quarterly / yearly
  interval: string;
  // 预填邮箱地址, 用于在支付页面自动填充用户邮箱
  email?: string;
  // 租户ID, 用于多租户场景下区分不同租户
  tenant_id?: string;

  constructor(plan: string, interval: string, email?: string, tenant_id?: string) {
    this.plan = plan;
    this.interval = interval;
    this.email = email;
    this.tenant_id = tenant_id;
  }
}

export class GetTenantInfoRequestDto {
  tenant_id: string;

  constructor(tenant_id: string) {
    this.tenant_id = tenant_id;
  }
}
