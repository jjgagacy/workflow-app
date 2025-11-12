import { QuotaType } from "../enums/quota.enum";
import { RestrictModel } from "./configuration.entity";

export abstract class HostingQuota {
  quotaType: QuotaType;
  restrictModels: RestrictModel[] = [];
}

export class TrialHostingQuota extends HostingQuota {
  quotaType: QuotaType = QuotaType.TRIAL;
  quotaLimit: number = 0;

  constructor(quotaLimit: number, restrictModels: RestrictModel[] = []) {
    super();
    this.quotaLimit = quotaLimit;
    this.restrictModels = restrictModels;
  }
}

export class PaidHostingQuota extends HostingQuota {
  quotaType: QuotaType = QuotaType.PAID;

  constructor(restrictModels: RestrictModel[] = []) {
    super();
    this.restrictModels = restrictModels;
  }
}

export class FreeHostingQuota extends HostingQuota {
  quotaType: QuotaType = QuotaType.FREE;

  constructor(restrictModels: RestrictModel[] = []) {
    super();
    this.restrictModels = restrictModels;
  }
}


