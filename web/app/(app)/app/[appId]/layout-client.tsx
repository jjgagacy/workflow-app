'use client';

import React, { useCallback, useEffect } from "react";
import AppLayout from "@/app/components/app/layout";
import { AppType } from "@/app/components/app/constants/appTypes";
import { AppMenuItem } from "@/app/components/app/app.type";
import { useTranslation } from "react-i18next";
import { Activity, FileText, Plug } from "lucide-react";

function LayoutClient({ children, appId }: { children: React.ReactNode, appId: string }) {
  const { t } = useTranslation();
  const [menuItems, setMenuItems] = React.useState<AppMenuItem[]>([]);

  const getAppMenuItems = useCallback((appId: string) => {
    const menuItems: AppMenuItem[] = [
      {
        name: t('app.appMenu.apiAccess'),
        href: `/app/${appId}/api`,
        icon: Plug,
      },
      {
        name: t('app.appMenu.log'),
        href: `/app/${appId}/log`,
        icon: FileText,
      },
      {
        name: t('app.appMenu.activity'),
        href: `/app/${appId}/activity`,
        icon: Activity,
      }
    ];
    return menuItems;
  }, [t]);

  useEffect(() => {
    const items = getAppMenuItems(appId);
    setMenuItems(items);
  }, [appId, getAppMenuItems]);

  return (
    <AppLayout appId={appId} appType={AppType.WORKFLOW} menuItems={menuItems}>
      {children}
    </AppLayout>
  );
}

export default LayoutClient;