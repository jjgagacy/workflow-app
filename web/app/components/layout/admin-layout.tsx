'use client';

import { Route } from "@/types/route";
import { ReactNode, useEffect, useMemo, useState } from "react";
import { Sidebar } from "../sidebar";
import { Navigation } from "../sidebar/navigation";
import { Navbar } from "../header/navbar";
import { usePersistentState } from "@/hooks/use-persistent-state";
import { MenuItem } from "@/types/menu";
import { convertMenuToRoutes, findMatchingRoute } from "@/utils/menu";
import Keepalive from "../header/keepalive";
import { usePathname, useRouter } from "next/navigation";
import { ViewProvider } from "../hooks/use-view";
import { useTagsViewStore } from "@/hooks/use-tagview-store";
import { useIsMobile } from "@/hooks/use-mobile";
import { useTranslation } from "react-i18next";
import { UserCog } from "lucide-react";
import { useMenus } from "../hooks/use-menus";

interface AdminLayoutProps {
  children: ReactNode;
  routes?: Route[];
}

export default function AdminLayout({ children, routes, ...rest }: AdminLayoutProps) {
  const [isCollapsed, setIsCollapsed] = usePersistentState("sidebarExpanded", false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const { addTag, include } = useTagsViewStore();
  const router = useRouter();
  const pathname = usePathname();
  const isMobile = useIsMobile();
  const { t } = useTranslation();
  const { defaultMenuItems } = useMenus();

  const toggleMobileSidebar = () => {
    setMobileSidebarOpen(!mobileSidebarOpen);
  };

  const menuItems: MenuItem[] = [
    ...defaultMenuItems,
    // ... other menu items
    ...(routes?.map(route => ({
      key: route.key,
      title: route.meta?.title || route.title,
      icon: route.icon ?? <UserCog className="w-4 h-4" />,
      path: route.path,
      children: route.children?.map(child => ({
        key: child.key,
        title: child.meta?.title || child.title,
        icon: child.icon ?? <UserCog className="w-4 h-4" />,
        path: child.path,
      }))
    })) || [])
  ];

  const [mergeRoutes] = useState<Route[]>(convertMenuToRoutes(menuItems));

  // 移动端自动折叠侧边栏
  useEffect(() => {
    if (isMobile) {
      setIsCollapsed(true);
    }
  }, [isMobile, setIsCollapsed]);

  const handleChildEvent = (data: boolean) => {
    if (isMobile) toggleMobileSidebar();
    else setIsCollapsed(data);
  }

  // 获取当前匹配的路由
  const matchRoute = useMemo(() => {
    // Recursive function to search through routes and their children
    return findMatchingRoute(mergeRoutes, pathname);
  }, [pathname, mergeRoutes]);

  // 路由变化时更新标签
  useEffect(() => {
    if (matchRoute) {
      addTag({
        key: matchRoute.key,
        name: matchRoute.meta.title,
        path: matchRoute.path,
      });
    } else if (pathname !== 'admin') {
      // router.push('/404');
    }
  }, [matchRoute, pathname, router]);

  // 计算侧边栏宽度
  const sidebarWidth = useMemo(() => {
    if (isMobile) {
      return 'ml-0';
    }
    return isCollapsed ? 'ml-32' : 'ml-64';
  }, [isCollapsed, isMobile]);

  // theme-xx replace xx to your theme
  return (
    <div className="flex theme-xx min-h-screen">
      {/* 桌面端侧边栏 */}
      {!isMobile && (
        <Sidebar onToggleCollapse={handleChildEvent} collapsed={isCollapsed}>
          <Navigation collapsed={isCollapsed} routes={mergeRoutes} />
        </Sidebar>
      )}
      {/* 移动端侧边栏抽屉 */}
      {isMobile && mobileSidebarOpen && (
        <div className="fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-black bg-opacity-50"
            onClick={() => setMobileSidebarOpen(false)}
          />
          <div className="absolute left-0 top-0 h-full w-64 bg-white dark:bg-gray-900 shadow-lg">
            <Sidebar onToggleCollapse={handleChildEvent} collapsed={false}>
              <Navigation collapsed={false} routes={mergeRoutes} toggleMobileSidebar={toggleMobileSidebar} />
            </Sidebar>
          </div>
        </div>
      )}
      <div className={`flex-1 flex flex-col overflow-x-auto transition-all ${sidebarWidth}`}>
        <Navbar
          routes={mergeRoutes}
          onMenuClick={isMobile ? toggleMobileSidebar : undefined}
        />
        {/* <TagView routes={mergeRoutes} /> */}
        <div className="flex-1 overflow-y-auto px-4 py-6">
          <Keepalive
            active={matchRoute === null ? null : matchRoute.key}
            include={include}
            isAsyncInclude
          >
            <ViewProvider value={{ name: matchRoute?.key || '' }}>
              {children}
            </ViewProvider>
          </Keepalive>
        </div>
      </div>
    </div>
  );
}