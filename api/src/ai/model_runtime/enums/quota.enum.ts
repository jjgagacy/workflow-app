export enum QuotaType {
  PAID = 'paid',
  FREE = 'free',
  TRIAL = 'trial',
}

export enum QuotaUnit {
  TIMES = 'times',
  TOKENS = 'tokens',
  CREDITS = 'credits',
}

export enum SystemConfigurationStatus {
  ACTIVE = 'active',
  UNSUPPORTED = 'unsupported',
  QUOTA_EXCEEDED = 'quota_exceeded',
}

export enum CustomConfigurationStatus {
  ACTIVE = 'active',
  UNSUPPORTED = 'unsupported'
}
