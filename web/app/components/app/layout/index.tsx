'use client';

import { usePathname, useRouter } from "next/navigation";
import React from "react";
import { useTranslation } from "react-i18next";
import Loading from "../../base/loading";
import { AppNavbar } from "../navbar";
import { useAppStore } from "../store";
import { AppMenuItem, testAppInfo } from "../app.type";
import { AppType } from "../constants/appTypes";

type AppLayoutProps = {
  children: React.ReactNode;
  appId: string;
  appType: AppType;
  menuItems: AppMenuItem[];
}

const AppLayout = ({ children, appId, appType, menuItems }: AppLayoutProps) => {
  const { t } = useTranslation();
  const router = useRouter();
  const pathname = usePathname();
  const { apps } = useAppStore();

  const appInfo = testAppInfo;

  if (!appInfo) {
    return (
      <div className='flex h-full items-center justify-center bg-background-body'>
        <Loading />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen">
      <AppNavbar appInfo={appInfo} appType={appType} menuItems={menuItems} />
      {children}
    </div>
  );
}

export default React.memo(AppLayout);