'use client';

import { ReactNode } from 'react';
import { Sidebar } from '../sidebar';
import { Navigation } from '../sidebar/navigation';
import { Route } from '@/types/route';
import { fa } from 'zod/v4/locales';

interface SidebarContainerProps {
  /** 是否折叠 */
  collapsed: boolean;
  /** 路由配置 */
  routes: Route[];
  /** 是否移动端 */
  isMobile: boolean;
  /** 移动端是否打开 */
  mobileOpen?: boolean;
  /** 折叠切换回调 */
  onToggleCollapse?: (collapsed: boolean) => void;
  /** 移动端关闭回调 */
  onMobileClose?: () => void;
  /** 自定义类名 */
  className?: string;
}

export function SidebarContainer({
  collapsed,
  routes,
  isMobile,
  mobileOpen = false,
  onToggleCollapse,
  onMobileClose,
  className = '',
}: SidebarContainerProps) {
  // 处理折叠事件
  const handleToggleCollapse = (data: boolean) => {
    onToggleCollapse?.(data);
  };

  // 移动端侧边栏
  if (isMobile) {
    if (!mobileOpen) return null;

    return (
      <div className={`fixed inset-0 z-50 ${className}`}>
        <div
          className="absolute inset-0 bg-black bg-opacity-50"
          onClick={onMobileClose}
        />
        <div className="absolute left-0 top-0 h-full w-64 bg-white dark:bg-gray-900 shadow-lg">
          <Sidebar onToggleCollapse={handleToggleCollapse} collapsed={false}>
            <Navigation
              collapsed={false}
              routes={routes}
              toggleMobileSidebar={onMobileClose}
            />
          </Sidebar>
        </div>
      </div>
    );
  }

  // 桌面端侧边栏
  return (
    <div className={className}>
      <Sidebar onToggleCollapse={handleToggleCollapse} collapsed={collapsed}>
        <Navigation collapsed={collapsed} routes={routes} />
      </Sidebar>
    </div>
  );
}