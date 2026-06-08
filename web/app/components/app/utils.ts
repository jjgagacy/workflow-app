import { AppInfo } from "@/api/graphql/app/types"
import { Apps } from "./app.type"
import { AppIconType, AppMode } from "./constants/appModes"

export const translateAppInfoToApps = (appInfo: AppInfo): Apps => {
  return {
    id: appInfo.id,
    name: appInfo.name,
    type: 'workflow', // 这里暂时写死，后续根据实际情况调整
    description: appInfo.description,
    mode: appInfo.mode as AppMode,
    icon: appInfo.icon,
    iconType: appInfo.iconType as AppIconType,
    enableSite: appInfo.enableSite,
    enableApi: appInfo.enableApi,
    isPublic: appInfo.isPublic,
    createdAt: appInfo.createdAt,
    createdBy: appInfo.createdBy,
  } as Apps;
}
