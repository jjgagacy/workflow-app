import { int } from "zod";
import { Operations } from "./menus/operations";
import { AppMenuItem, Apps } from "../app.type";
import { ZoomControlsMenu } from "./menus/zoom";
import { HelpMenu } from "./menus/help";
import { AppType, getAllAppTypes } from "../constants/appTypes";
import { useAppTypes } from "../hooks/use-appTypes";
import { AppTypeInfo } from "./app-type-info";
import { PublishMenu } from "./menus/publish";

interface AppNavBarProps {
  appInfo: Apps
  appType: AppType
}

interface AppNavBarProps {
  appInfo: Apps
  appType: AppType
  menuItems: AppMenuItem[]
}


export function AppNavbar({ appInfo, appType, menuItems }: AppNavBarProps) {
  const { getAppType } = useAppTypes()
  const appConfig = getAppType[appType];

  return (
    <div className="flex items-center rounded-lg mr-2 h-[3.5rem] shrink-0">
      <AppTypeInfo typeItem={appConfig} />
      <div className="flex-1 flex items-center justify-center">
        <Operations appInfo={appInfo} menuItems={menuItems} />
      </div>
      <div className="flex items-center gap-1 px-4">
        <PublishMenu />
        <ZoomControlsMenu />
        <HelpMenu />
      </div>
    </div>
  );
}