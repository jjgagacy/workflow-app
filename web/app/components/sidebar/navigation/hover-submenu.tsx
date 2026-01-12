'use client';
import { MenuItem } from '@/types/menu';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

interface NavigationProps {
  collapsed: boolean;
  routes?: MenuItem[];
  toggleMobileSidebar?: () => void;
}

// 创建独立的悬浮菜单组件
export const HoverSubmenu = ({
  hoveredItem,
  menuPosition,
  menuItems,
  collapsed,
  isActive,
  toggleMobileSidebar,
  setHoveredItem,
  onMouseEnter,
  onMouseLeave
}: any) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  if (!mounted || !hoveredItem) return null;

  const menu = menuItems.find((i: any) => i.key === hoveredItem);
  if (!menu?.children?.length) return null;

  return createPortal(
    <div
      className="fixed bg-white dark:bg-neutral-800 shadow-2xl rounded-lg py-2 z-[2147483647] border border-gray-200 dark:border-gray-700 backdrop-blur-sm"
      style={{
        left: collapsed ? '5rem' : '16rem',
        top: `${menuPosition}px`,
        minWidth: "14rem",
        // transform: 'translateY(-50%)'
      }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div className="flex flex-col">
        {menu.children.map((child: any) => (
          <Link
            key={child.key}
            onClick={() => {
              toggleMobileSidebar?.()
              setHoveredItem('');
            }}
            href={child.path || '#'}
            className={`flex mb-1 mx-2 items-center px-2 py-1 rounded-md hover:bg-gray-100 dark:hover:bg-neutral-700 transition-colors ${isActive(child.path) ? "bg-gray-100 dark:bg-neutral-700 font-medium" : ""}`}
          >
            <span className="mr-3">{child.icon}</span>
            <span>{child.title}</span>
          </Link>
        ))}
      </div>
    </div>,
    document.body // 渲染到 body，确保在最顶层
  );
};