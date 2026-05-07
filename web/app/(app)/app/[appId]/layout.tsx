import React from "react";
import AppLayout from "@/app/components/app/layout";
import { AppType } from "@/app/components/app/constants/appTypes";

type LayoutProps = {
  children: React.ReactNode;
  params: Promise<{ appId: string }>;
}

async function Layout({ children, params }: LayoutProps) {
  const { appId } = await params;

  return (
    <AppLayout appId={appId} appType={AppType.WORKFLOW}>
      {children}
    </AppLayout>
  );
}

export default Layout;