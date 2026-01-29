'use client';

import { MenuItem } from '@/types/menu';

import { IconChevronDown, IconChevronRight, IconEyeCog } from '@tabler/icons-react';
import { Briefcase, Cog, Crown, Fingerprint, Home, LayoutDashboard, List, Sliders, UserCheck, UserCog } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { HoverSubmenu } from './hover-submenu';
import { useTranslation } from 'react-i18next';
import { useActiveAppearance } from '../../appearance';
import { getThemeActiveClass, getThemeBgClass, getThemeHoverClass, ThemeType } from '@/types/theme';

interface NavigationProps {
  collapsed: boolean;
  routes?: MenuItem[];
  toggleMobileSidebar?: () => void;
}

export function Navigation({ collapsed, routes, toggleMobileSidebar }: NavigationProps) {
  const [openSubmenus, setOpenSubmenus] = useState<Record<string, boolean>>({});
  const [hoveredItem, setHoveredItem] = useState('');
  const [menuPosition, setMenuPosition] = useState(0);
  const { t } = useTranslation();

  const pathname = usePathname();
  const subMenuRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const hoverRef = useRef<{ key: string; timeout: NodeJS.Timeout | null }>({ key: '', timeout: null });
  const { activeAppearance: activeTheme } = useActiveAppearance();

  const defaultMenus: MenuItem[] = [
    {
      key: 'dashboard',
      title: t('system.dashboard'),
      icon: <LayoutDashboard className="w-5 h-5" />,
      path: "/workspace",
    },
    {
      key: 'system',
      title: t('system.system_settings'),
      icon: <Sliders className="w-5 h-5" />,
      path: '/workspace/system',
      children: [
        { key: 'account', title: t('system.account'), icon: <UserCog className="w-4 h-4" />, path: "/workspace/system/account" },
        { key: 'dep', title: t('system.department'), icon: <Briefcase className="w-4 h-4" />, path: "/workspace/system/dep" },
        { key: 'role', title: t('system.role'), icon: <Crown className="w-4 h-4" />, path: "/workspace/system/role" },
        { key: 'module', title: t('system.permission_module'), icon: <Fingerprint className="w-4 h-4" />, path: "/workspace/system/module" },
        // { key: 'menu', title: t('system.menu'), icon: <List className="w-4 h-4" />, path: "/workspace/system/menu" },
      ]
    },
    {
      key: 'foo',
      title: "Foo",
      icon: <UserCog className="w-5 h-5" />,
      path: '/workspace/foo',
      children: [
        { key: 'foo', title: "Foo", icon: <UserCog className="w-4 h-4" />, path: "/workspace/foo/foo" },
        { key: 'bar', title: "Boo", icon: <UserCog className="w-4 h-4" />, path: "/workspace/foo/bar" },
      ]
    },
    {
      key: 'monie',
      title: 'Monie',
      icon: <IconEyeCog className='w-5 h-5' />,
      path: 'http://monie.cc/',
      fetched: true,
    },
    // ... other menu items
    ...(routes?.filter(route => route.fetched).map(route => ({
      key: route.key,
      title: route.meta?.title || route.title,
      icon: route.icon ?? <List className="w-4 h-4" />,
      path: route.path,
      children: route.children?.map(child => ({
        key: child.key,
        title: child.meta?.title || child.title,
        icon: child.icon ?? <List className="w-4 h-4" />,
        path: child.path,
      }))
    })) || [])
  ];

  const menuItems = defaultMenus;

  const toggleSubmenu = (title: string) => {
    setOpenSubmenus(prev => ({
      ...prev,
      [title]: !prev[title]
    }));
  }

  const isActive = (path?: string) => {
    return path && pathname === path;
  }

  useEffect(() => {
    const newState: Record<string, boolean> = {};
    menuItems.forEach(item => {
      if (item.children) {
        newState[item.title] = item.children?.some(child => pathname.startsWith(child.path || '')) || false;
      } else {
        newState[item.title] = pathname.startsWith(item.path || '');
      }
    });
    setOpenSubmenus(newState);
  }, [pathname]);

  // 清理超时
  useEffect(() => {
    return () => {
      if (hoverRef.current.timeout) {
        clearTimeout(hoverRef.current.timeout);
      }
    };
  }, []);

  const handleMouseEnter = (e: React.MouseEvent, key: string) => {
    if (collapsed) {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (hoverRef.current.timeout) {
        clearTimeout(hoverRef.current.timeout);
        hoverRef.current.timeout = null;
      }
      setHoveredItem(key);
      const target = e.currentTarget as HTMLElement;
      const rect = target.getBoundingClientRect();
      console.log(target, rect.top);
      // setMenuPosition(target.getBoundingClientRect().top);
      setMenuPosition(rect.top + rect.height / 2 - 30);
    }
  }

  const handleMouseLeave = (e: React.MouseEvent) => {
    if (collapsed) {
      const fromEl = e.relatedTarget as HTMLElement;
      if (!subMenuRef.current || !fromEl || !(fromEl instanceof Node)) {
        timeoutRef.current = setTimeout(() => {
          setHoveredItem('');
        }, 500);
        return;
      }

      // 检查鼠标是否移向子菜单
      const isMovingToSubmenu = subMenuRef.current.contains(fromEl) ||
        fromEl === subMenuRef.current;
      if (!isMovingToSubmenu) {
        timeoutRef.current = setTimeout(() => {
          setHoveredItem('');
        }, 500);
      }
    }
  }

  const handleDropdownMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  };

  const handleDropdownMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setHoveredItem('');
    }, 500);
  };

  return (
    <div className={`bg-background py-2 px-2 navigation-menu__root space-y-1 relative z-10`}>
      {menuItems.map((item) => (
        <div key={item.key}>
          {item.children && collapsed ? (
            <ul>
              <li
                className={`relative px-2 py-1 rounded-lg ${getThemeHoverClass(activeTheme as ThemeType)}`}
                onMouseEnter={(e) => handleMouseEnter(e, item.key)}
                onMouseLeave={handleMouseLeave}
              >
                <div
                  className={`navigation-menu__trigger flex justify-center items-center w-full rounded-lg ${collapsed ? "justify-center" : ""
                    } ${isActive(item.path) ? `${getThemeActiveClass(activeTheme as ThemeType)} ${getThemeBgClass(activeTheme as ThemeType)}` : ""}`}
                  title={item.title}
                >
                  {item.icon}
                </div>
              </li>
            </ul>
          ) : !item.children ? (
            <div className='relative'>
              <div className={`flex items-center px-2 py-1 rounded-lg ${getThemeHoverClass(activeTheme as ThemeType)} cursor-pointer ${collapsed ? "justify-center" : "justify-between"}`}>
                <Link
                  href={item.path || '#'}
                  onClick={() => toggleMobileSidebar?.()}
                  className={`flex items-center font-medium`}
                  title={item.title}
                >
                  <div className="flex items-center">
                    <span>{item.icon}</span>
                    {!collapsed && (<span className="ml-3 font-medium">{item.title}</span>)}
                  </div>
                  {!collapsed && (<span>&nbsp;</span>)}
                </Link>
              </div>
            </div>
          ) : (
            <div>
              <div
                className={`flex items-center px-2 py-1 rounded-lg ${getThemeHoverClass(activeTheme as ThemeType)} cursor-pointer ${collapsed ? "justify-center" : "justify-between"
                  }`}
                onClick={() => toggleSubmenu(item.title)}
              >
                <div className="flex items-center">
                  <span>{item.icon}</span>
                  {!collapsed && <span className="ml-3 font-medium">{item.title}</span>}
                </div>
                {!collapsed && (
                  <span>
                    {openSubmenus[item.title] ? (
                      <IconChevronDown className="w-4 h-4" />
                    ) : (
                      <IconChevronRight className="w-4 h-4" />
                    )}
                  </span>
                )}
              </div>
              {openSubmenus[item.title] && !collapsed && (
                <div className={`py-1 ${collapsed ? "pl-0" : "pl-10"}`}>
                  {item.children.map((child) => (
                    <Link
                      key={child.key}
                      onClick={() => toggleMobileSidebar?.()}
                      href={child.path || '#'}
                      className={`flex items-center px-2 py-1 mb-1 rounded-lg ${getThemeHoverClass(activeTheme as ThemeType)} ${collapsed ? "justify-center" : ""
                        } ${isActive(child.path) ? `${getThemeActiveClass(activeTheme as ThemeType)} ${getThemeBgClass(activeTheme as ThemeType)} border border-[var(--border)]` : ""}`}
                    >
                      <span>{child.icon}</span>
                      <span className="ml-3 font-medium">{child.title}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      ))}

      <HoverSubmenu
        hoveredItem={hoveredItem}
        menuPosition={menuPosition}
        menuItems={menuItems}
        collapsed={collapsed}
        isActive={isActive}
        toggleMobileSidebar={toggleMobileSidebar}
        setHoveredItem={setHoveredItem}
        onMouseEnter={handleDropdownMouseEnter}
        onMouseLeave={handleDropdownMouseLeave}
      />
    </div>
  );
}