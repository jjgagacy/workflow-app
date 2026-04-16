import { AppIconType, AppMode } from "@/app/components/app/app.type";

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
