import { QuotaUnit } from "../enums/quota.enum";
import { Credentials } from "../types/credentials.type";
import { HostingQuota } from "./hosting-quota.entity";

export class HostingProvider {
  enabled: boolean = false;
  credentials?: Credentials;
  quotaUnit?: QuotaUnit;
  quotas: HostingQuota[] = [];

  constructor(config?: Partial<HostingProvider>) {
    if (config) {
      Object.assign(this, config);
    }
  }
}

export class HostedModeration {
  enabled: boolean = false;
  providers: string[] = [];

  constructor(config?: Partial<HostedModeration>) {
    if (config) {
      Object.assign(this, config);
    }
  }
}
