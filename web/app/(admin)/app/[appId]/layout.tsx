import React from "react";
import AppLayout from "@/app/components/app/layout";

type LayoutProps = {
  children: React.ReactNode;
  params: Promise<{ appId: string }>;
}

async function Layout({ children, params }: LayoutProps) {
  const { appId } = await params;

  return (
    <AppLayout appId={appId}>
      {children}
    </AppLayout>
  );
}

export default Layout;