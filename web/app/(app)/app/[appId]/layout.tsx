import React, { } from "react";
import LayoutClient from "./layout-client";

type LayoutProps = {
  children: React.ReactNode;
  params: Promise<{ appId: string }>;
}

async function Layout({ children, params }: LayoutProps) {
  const { appId } = await params;

  return (
    <LayoutClient appId={appId}>
      {children}
    </LayoutClient>
  );
}

export default Layout;