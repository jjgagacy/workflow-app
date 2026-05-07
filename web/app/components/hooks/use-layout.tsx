'use client';

import { useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import { convertMenuToRoutes, findMatchingRoute } from "@/utils/menu";
import { MenuItem } from "@/types/menu";
import { Route } from "@/types/route";
import { UserCog } from "lucide-react";
import { useMenus } from "./use-menus";
import { useSidebar } from "./use-sidebar";

interface UseLayoutCoreProps {
  /** 外部传入的路由配置 */
  routes?: Route[];
}

interface UseLayoutCoreReturn {
  /** 合并后的路由 */
  mergeRoutes: Route[];
  /** 当前匹配的路由 */
  matchRoute: Route | null;
  /** 侧边栏宽度样式类 */
  sidebarWidth: string;
  /** 移动端判断 */
  isMobile: boolean;
  /** 侧边栏折叠状态 */
  collapsed: boolean;
  /** 移动端侧边栏打开状态 */
  mobileOpen: boolean;
  /** 切换侧边栏 */
  toggleSidebar: () => void;
  /** 设置侧边栏折叠状态 */
  setCollapsed: (collapsed: boolean) => void;
  /** 设置移动端侧边栏状态 */
  setMobileOpen: (open: boolean) => void;
  /** 处理子组件事件 */
  handleChildEvent: (data: boolean) => void;
}

export function useLayoutCore({ routes = [] }: UseLayoutCoreProps = {}): UseLayoutCoreReturn {
  const pathname = usePathname();
  const { defaultMenuItems, hiddenMenuRouteItems } = useMenus();
  const {
    collapsed,
    setCollapsed,
    mobileOpen,
    setMobileOpen,
    isMobile,
    toggleSidebar
  } = useSidebar();

  // 构建菜单项
  const menuItems: MenuItem[] = useMemo(() => [
    ...hiddenMenuRouteItems,
    ...defaultMenuItems,
    ...routes.map(route => ({
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
    }))
  ], [hiddenMenuRouteItems, defaultMenuItems, routes]);

  // 转换菜单为路由
  const [mergeRoutes] = useState<Route[]>(() => convertMenuToRoutes(menuItems));

  // 处理子组件事件
  const handleChildEvent = (data: boolean) => {
    if (isMobile) {
      toggleSidebar();
    } else {
      setCollapsed(data);
    }
  };

  // 获取当前匹配的路由
  const matchRoute = useMemo(() => {
    return findMatchingRoute(mergeRoutes, pathname);
  }, [pathname, mergeRoutes]);

  // 计算侧边栏宽度
  const sidebarWidth = useMemo(() => {
    if (isMobile) {
      return 'ml-0';
    }
    return collapsed ? 'ml-32 md:ml-20' : 'ml-64';
  }, [collapsed, isMobile]);

  return {
    mergeRoutes,
    matchRoute,
    sidebarWidth,
    isMobile,
    collapsed,
    mobileOpen,
    toggleSidebar,
    setCollapsed,
    setMobileOpen,
    handleChildEvent,
  };
}