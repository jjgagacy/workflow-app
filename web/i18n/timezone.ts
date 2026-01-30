'use client';

export interface TimezoneInfo {
  id: string;
  labelKey: string;
  offset: string;
  region: string;
}

export const TIME_ZONES: TimezoneInfo[] = [
  // 亚洲时区
  {
    id: 'Asia/Shanghai',
    labelKey: 'timezone.Asia/Shanghai',
    offset: 'UTC+8',
    region: 'Asia'
  },
  {
    id: 'Asia/Tokyo',
    labelKey: 'timezone.Asia/Tokyo',
    offset: 'UTC+9',
    region: 'Asia'
  },
  {
    id: 'Asia/Seoul',
    labelKey: 'timezone.Asia/Seoul',
    offset: 'UTC+9',
    region: 'Asia'
  },
  {
    id: 'Asia/Taipei',
    labelKey: 'timezone.Asia/Taipei',
    offset: 'UTC+8',
    region: 'Asia'
  },
  {
    id: 'Asia/Hong_Kong',
    labelKey: 'timezone.Asia/Hong_Kong',
    offset: 'UTC+8',
    region: 'Asia'
  },
  {
    id: 'Asia/Singapore',
    labelKey: 'timezone.Asia/Singapore',
    offset: 'UTC+8',
    region: 'Asia'
  },
  {
    id: 'Asia/Bangkok',
    labelKey: 'timezone.Asia/Bangkok',
    offset: 'UTC+7',
    region: 'Asia'
  },
  {
    id: 'Asia/Ho_Chi_Minh',
    labelKey: 'timezone.Asia/Ho_Chi_Minh',
    offset: 'UTC+7',
    region: 'Asia'
  },
  {
    id: 'Asia/Jakarta',
    labelKey: 'timezone.Asia/Jakarta',
    offset: 'UTC+7',
    region: 'Asia'
  },
  {
    id: 'Asia/Manila',
    labelKey: 'timezone.Asia/Manila',
    offset: 'UTC+8',
    region: 'Asia'
  },
  {
    id: 'Asia/Kolkata',
    labelKey: 'timezone.Asia/Kolkata',
    offset: 'UTC+5:30',
    region: 'Asia'
  },

  // 欧洲时区
  {
    id: 'Europe/London',
    labelKey: 'timezone.Europe/London',
    offset: 'UTC+0/+1',
    region: 'Europe'
  },
  {
    id: 'Europe/Paris',
    labelKey: 'timezone.Europe/Paris',
    offset: 'UTC+1/+2',
    region: 'Europe'
  },
  {
    id: 'Europe/Berlin',
    labelKey: 'timezone.Europe/Berlin',
    offset: 'UTC+1/+2',
    region: 'Europe'
  },
  {
    id: 'Europe/Madrid',
    labelKey: 'timezone.Europe/Madrid',
    offset: 'UTC+1/+2',
    region: 'Europe'
  },
  {
    id: 'Europe/Rome',
    labelKey: 'timezone.Europe/Rome',
    offset: 'UTC+1/+2',
    region: 'Europe'
  },
  {
    id: 'Europe/Moscow',
    labelKey: 'timezone.Europe/Moscow',
    offset: 'UTC+3',
    region: 'Europe'
  },

  // 美洲时区
  {
    id: 'America/New_York',
    labelKey: 'timezone.America/New_York',
    offset: 'UTC-5/-4',
    region: 'America'
  },
  {
    id: 'America/Los_Angeles',
    labelKey: 'timezone.America/Los_Angeles',
    offset: 'UTC-8/-7',
    region: 'America'
  },
  {
    id: 'America/Toronto',
    labelKey: 'timezone.America/Toronto',
    offset: 'UTC-5/-4',
    region: 'America'
  },
  {
    id: 'America/Sao_Paulo',
    labelKey: 'timezone.America/Sao_Paulo',
    offset: 'UTC-3',
    region: 'America'
  },

  // 非洲时区
  {
    id: 'Africa/Cairo',
    labelKey: 'timezone.Africa/Cairo',
    offset: 'UTC+2',
    region: 'Africa'
  },
  {
    id: 'Africa/Johannesburg',
    labelKey: 'timezone.Africa/Johannesburg',
    offset: 'UTC+2',
    region: 'Africa'
  },

  // 大洋洲时区
  {
    id: 'Australia/Sydney',
    labelKey: 'timezone.Australia/Sydney',
    offset: 'UTC+10/+11',
    region: 'Australia'
  },
  {
    id: 'Pacific/Auckland',
    labelKey: 'timezone.Pacific/Auckland',
    offset: 'UTC+12/+13',
    region: 'Pacific'
  },

  // 标准时区
  {
    id: 'UTC',
    labelKey: 'timezone.UTC',
    offset: 'UTC',
    region: 'Global'
  },
  {
    id: 'GMT',
    labelKey: 'timezone.GMT',
    offset: 'UTC+0',
    region: 'Global'
  },
];