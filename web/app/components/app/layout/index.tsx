'use client';

import { usePathname, useRouter } from "next/navigation";
import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import Loading from "../../base/loading";
import { AppNavbar } from "../navbar";
import { useAppStore } from "../store";
import { AppMenuItem, testAppInfo } from "../app.type";
import { AppType } from "../constants/appTypes";
import { useShallow } from 'zustand/react/shallow';
import { useGetAppInfo } from "@/api/graphql/app/queries/app-info";
import { toast } from "@/app/ui/toast";
import { getErrorMessage } from "@/utils/errors";
import { BASE_URL } from "@/config";
import { translateAppInfoToApps } from "../utils";

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
  const { appInfo, setAppInfo } = useAppStore(useShallow(
    state => ({
      appInfo: state.appInfo,
      setAppInfo: state.setAppInfo,
    })
  ));
  const getAppInfo = useGetAppInfo();
  const { data, mutate, isLoading, error } = getAppInfo({ appId });

  useEffect(() => {
    if (error) {
      toast.error(getErrorMessage(error));
      router.push(`${BASE_URL}/apps`);
    }
  }, [error, appType, router]);

  useEffect(() => {
    if (data && !error) {
      setAppInfo(translateAppInfoToApps(data));
    }
  }, [data, error, setAppInfo]);


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
