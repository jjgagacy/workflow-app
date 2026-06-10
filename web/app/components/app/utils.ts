import { AppInfo } from "@/api/graphql/app/types"
import { Apps } from "./app.type"
import { AppIconType, AppMode } from "./constants/appModes"
import { BASE_URL } from "@/config";

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

export const getAppRedirectUrl = (appId: string, mode?: string) => {
  switch (mode) {
    case AppMode.WORKFLOW:
      return `${BASE_URL}/app/${appId}/workflow`;
    case AppMode.CHAT:
      return `${BASE_URL}/app/${appId}/chat`;
    default:
      return `${BASE_URL}/apps`;
  };
}

export const appRedirect = (url: string, redirectFn?: (url: string) => void) => {
  if (redirectFn) {
    redirectFn(url);
  } else {
    window.location.href = url;
  }
}