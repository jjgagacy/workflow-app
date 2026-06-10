import { AppIconType, AppMode } from '@/app/components/app/constants/appModes';

export type BaseAppInput = {
  name: string;
  description?: string;
  iconType: AppIconType;
  icon: string;
}

export type CreateAppInput = {
  mode: AppMode;
} & BaseAppInput;

export type UpdateAppInput = BaseAppInput;

export type CreateAppResponse = {
  createApp: {
    id: string;
  };
}

export type AppInfo = {
  id: string;
  name: string;
  description: string;
  mode: string;
  icon: string;
  iconType: string;
  enableSite: boolean;
  enableApi: boolean;
  isPublic: boolean;
  createdAt: string;
  createdBy: string;
}

export interface GetAppInfoResponse {
  appInfo: AppInfo;
}
