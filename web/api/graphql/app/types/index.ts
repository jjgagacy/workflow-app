import { AppIconType, AppMode } from '@/app/components/app/constants/appModes';

export type CreateAppInput = {
  name: string;
  description?: string;
  iconType: AppIconType;
  icon: string;
  mode: AppMode;
}

export type CreateAppResponse = {
  id: string;
}
