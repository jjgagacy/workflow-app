'use client';

import { useState, useEffect, useCallback } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { usePersistentState } from '@/hooks/use-persistent-state';

interface UseSidebarOptions {
  /** 默认是否折叠 */
  defaultCollapsed?: boolean;
  /** 是否持久化折叠状态 */
  persist?: boolean;
  /** 持久化存储的 key */
  storageKey?: string;
}

export function useSidebar(options: UseSidebarOptions = {}) {
  const {
    defaultCollapsed = false,
    persist = true,
    storageKey = 'adminSidebarExpanded'
  } = options;

  const isMobile = useIsMobile();

  // 折叠状态管理
  const [persistedCollapsed, setPersistedCollapsed] = usePersistentState(
    storageKey,
    defaultCollapsed
  );
  const [localCollapsed, setLocalCollapsed] = useState(defaultCollapsed);

  const collapsed = persist ? persistedCollapsed : localCollapsed;
  const setCollapsed = persist ? setPersistedCollapsed : setLocalCollapsed;

  // 移动端抽屉状态
  const [mobileOpen, setMobileOpen] = useState(false);

  // 移动端自动折叠
  useEffect(() => {
    if (isMobile) {
      setCollapsed(true);
    }
  }, [isMobile, setCollapsed]);

  // 切换侧边栏
  const toggleSidebar = useCallback(() => {
    if (isMobile) {
      setMobileOpen(prev => !prev);
    } else {
      setCollapsed(prev => !prev);
    }
  }, [isMobile, setCollapsed]);

  // 关闭移动端侧边栏
  const closeMobileSidebar = useCallback(() => {
    setMobileOpen(false);
  }, []);

  // 处理子组件事件
  const handleChildToggle = useCallback((data: boolean) => {
    if (isMobile) {
      setMobileOpen(!mobileOpen);
    } else {
      setCollapsed(data);
    }
  }, [isMobile, mobileOpen, setCollapsed]);

  return {
    collapsed,
    mobileOpen,
    isMobile,
    toggleSidebar,
    closeMobileSidebar,
    setCollapsed,
    setMobileOpen,
    handleChildToggle,
  };
}