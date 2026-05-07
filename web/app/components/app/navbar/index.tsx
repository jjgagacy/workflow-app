import { int } from "zod";
import { AppActions } from "./app-actions";
import { Apps } from "../app.type";
import { ZoomControlsMenu } from "./menus/zoom";
import { HelpMenu } from "./menus/help";
import { AppType, getAllAppTypes } from "../constants/appTypes";
import { useAppTypes } from "../hooks/use-appTypes";
import { AppTypeInfo } from "./app-type-info";

interface AppNavBarProps {
  appInfo: Apps
  appType: AppType
}


export function AppNavbar({ appInfo, appType }: AppNavBarProps) {
  const { getAppType } = useAppTypes()
  const appConfig = getAppType[appType];

  return (
    <div className="flex items-center rounded-lg mr-2 h-[3.5rem] shrink-0">
      <AppTypeInfo typeItem={appConfig} />
      <div className="flex-1 flex items-center justify-center">
        <AppActions appInfo={appInfo} />
      </div>
      <div className="flex items-center gap-1 px-4">
        <ZoomControlsMenu />
        <HelpMenu />
      </div>
    </div>
  );
}