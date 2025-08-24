'use client';
import { MenuItem } from '@/types/menu';


import {
    Icon12Hours, Icon3dCubeSphereOff, IconAbc,
    IconAdjustmentsPin, IconAlertHexagonFilled, IconAlertSquare,
    IconChevronDown, IconChevronRight,
    IconEyeCog, IconLocationCode
} from '@tabler/icons-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

interface NavigationProps {
    collapsed: boolean;
    routes?: MenuItem[];
    toggleMobileSidebar?: () => void;
}

export function Navigation({ collapsed, routes, toggleMobileSidebar }: NavigationProps) {
    const [openSubmenus, setOpenSubmenus] = useState<Record<string, boolean>>({});
    const [hoveredItem, setHoveredItem] = useState('');
    const [menuPosition, setMenuPosition] = useState(0);

    const pathname = usePathname();
    const subMenuRef = useRef<HTMLDivElement>(null);

    const defaultMenus: MenuItem[] = [
        {
            key: 'dashboard',
            title: "仪表盘",
            icon: <IconEyeCog className="w-5 h-5" />,
            path: "/admin/dashboard"
        },
        {
            key: 'system',
            title: "系统设置",
            icon: <Icon12Hours className="w-5 h-5" />,
            path: '/admin/system',
            children: [
                { key: 'account', title: "账户", icon: <IconAbc className="w-4 h-4" />, path: "/admin/system/account" },
                { key: 'dep', title: "部门", icon: <IconLocationCode className="w-4 h-4" />, path: "/admin/system/dep" },
                { key: 'role', title: "角色", icon: <Icon3dCubeSphereOff className="w-4 h-4" />, path: "/admin/system/role" },
                { key: 'module', title: "权限模块", icon: <IconAdjustmentsPin className="w-4 h-4" />, path: "/admin/system/module" },
                { key: 'menu', title: "菜单", icon: <IconAlertHexagonFilled className="w-4 h-4" />, path: "/admin/system/menu" },
            ]
        },
        // ... other menu items
        ...(routes?.filter(route => route.fetched).map(route => ({
            key: route.key,
            title: route.meta?.title || route.title,
            icon: route.icon ?? <IconAlertSquare className="w-4 h-4" />,
            path: route.path,
            children: route.children?.map(child => ({
                key: child.key,
                title: child.meta?.title || child.title,
                icon: child.icon ?? <IconAlertSquare className="w-4 h-4" />,
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

    const handleMouseEnter = (e: React.MouseEvent, key: string) => {
        if (collapsed) {
            setHoveredItem(key);
            const target = e.currentTarget as HTMLElement;
            setMenuPosition(target.getBoundingClientRect().top);
        }
    }

    const handleMouseLeave = (e: React.MouseEvent) => {
        if (collapsed) {
            const fromEl = e.relatedTarget as HTMLElement;
            if (!subMenuRef.current || !fromEl) return;

            // 检查鼠标是否移向子菜单
            const isMovingToSubmenu = subMenuRef.current.contains(fromEl) ||
                fromEl === subMenuRef.current;
            if (!isMovingToSubmenu) {
                setHoveredItem('');
            }
        }
    }

    return (
        <div className="bg-white dark:bg-black navigation-menu__root space-y-1 relative z-10">
            {menuItems.map((item) => (
                <div key={item.key}>
                    {item.children && collapsed ? (
                        <ul>
                            <li
                                className="relative"
                                onMouseEnter={(e) => handleMouseEnter(e, item.key)}
                                onMouseLeave={handleMouseLeave as any}
                            >
                                <div
                                    className={`navigation-menu__trigger flex items-center px-2 py-1 w-full rounded-lg hover:bg-selection-hover ${collapsed ? "justify-center" : ""
                                        } ${isActive(item.path) ? "bg-selection-active" : ""}`}
                                    title={item.title}
                                >
                                    {item.icon}
                                </div>
                            </li>
                        </ul>
                    ) : !item.children ? (
                        <div>
                            <Link
                                href={item.path || '#'}
                                onClick={() => toggleMobileSidebar?.()}
                                className={`flex items-center px-2 py-1 rounded-lg hover:bg-selection-hover ${collapsed ? "justify-center" : ""
                                    } ${isActive(item.path) ? "bg-selection-active" : ""}`}
                                title={item.title}
                            >
                                <span>{item.icon}</span>
                                {!collapsed && (
                                    <span className="ml-3">{item.title}</span>
                                )}
                            </Link>
                        </div>
                    ) : (
                        <div>
                            <div
                                className={`flex items-center px-2 py-1 rounded-lg hover:bg-selection-hover cursor-pointer ${collapsed ? "justify-center" : "justify-between"
                                    } ${item.children.some(c => isActive(c.path)) ? "bg-selection-active" : ""}`}
                                onClick={() => toggleSubmenu(item.title)}
                            >
                                <div className="flex items-center">
                                    <span>{item.icon}</span>
                                    {!collapsed && <span className="ml-3">{item.title}</span>}
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
                                            className={`flex items-center px-2 py-1 rounded-lg hover:bg-selection-hover ${collapsed ? "justify-center" : ""
                                                } ${isActive(child.path) ? "bg-selection-active" : ""}`}
                                        >
                                            <span>{child.icon}</span>
                                            <span className="ml-3">{child.title}</span>
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            ))}

            {/* Hover submenu for collapsed state */}
            {hoveredItem && collapsed && (
                <div
                    ref={subMenuRef}
                    className="fixed bg-white dark:bg-black shadow-lg rounded-md py-1 z-50"
                    style={{
                        left: '5rem',
                        top: `${menuPosition}px`,
                        minWidth: "12rem"
                    }}
                    onMouseLeave={() => setHoveredItem('')}
                >
                    <div className="flex flex-col">
                        {menuItems.find(i => i.key === hoveredItem)?.children?.map(child => (
                            <Link
                                key={child.key}
                                onClick={() => toggleMobileSidebar?.()}
                                href={child.path || '#'}
                                className={`flex items-center pt-2 pb-2 rounded-md hover:bg-gray-100 pl-4 ${collapsed ? "justify-start" : ""
                                    } ${isActive(child.path) ? "bg-gray-100" : ""}`}
                            >
                                <span>{child.icon}</span>
                                <span className="ml-3">{child.title}</span>
                            </Link>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}