'use client';

import { Route } from "@/types/route";
import { ReactNode } from "react";
import { ViewProvider } from "../hooks/use-view";
import { LayoutWrapper } from ".";
import { SidebarContainer } from "../sidebar/container";
import { SidebarWrapper } from "../sidebar/wrapper";
import { useLayoutCore } from "../hooks/use-layout";

interface AppLayoutProps {
  children: ReactNode;
  routes?: Route[];
}

export default function AppLayout({ children, routes, ...rest }: AppLayoutProps) {
  const { mergeRoutes, handleChildEvent, matchRoute, sidebarWidth, collapsed, mobileOpen, setMobileOpen, isMobile, toggleSidebar } = useLayoutCore();

  return (
    <SidebarWrapper>
      <SidebarContainer
        collapsed={collapsed}
        routes={mergeRoutes}
        isMobile={isMobile}
        mobileOpen={mobileOpen}
        onToggleCollapse={handleChildEvent}
        onMobileClose={() => setMobileOpen(false)}
      />
      <LayoutWrapper sidebarWidth={sidebarWidth}>
        <div className="flex-1 overflow-y-auto">
          <ViewProvider value={{ name: matchRoute?.key || '' }}>
            {children}
          </ViewProvider>
        </div>
      </LayoutWrapper>
    </SidebarWrapper>
  );
}
