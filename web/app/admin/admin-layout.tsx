'use client';

import { Route } from "@/types/route";
import { ReactNode, useEffect, useMemo, useRef, useState } from "react";
import { Sidebar } from "../components/sidebar";
import { Navigation } from "../components/sidebar/navigation";
import { Navbar } from "../components/header/navbar";
import { TagView } from "../components/header/tagview";
import { usePersistentState } from "@/hooks/use-persistent-state";
import { MenuItem } from "@/types/menu";
import { Icon12Hours, Icon3dCubeSphereOff, IconAbc, IconAdjustmentsPin, IconAlertHexagonFilled, IconAlertSquare, IconEyeCog, IconLocationCode } from "@tabler/icons-react";
import { convertMenuToRoutes, findMatchingRoute } from "@/utils/menu";
import Keepalive from "../components/header/keepalive";
import { usePathname, useRouter } from "next/navigation";
import { ViewProvider } from "../components/hooks/use-view";
import { useTagsViewStore } from "@/hooks/use-tagview-store";
import { useIsMobile } from "@/hooks/use-mobile";

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

    const toggleMobileSidebar = () => {
        setMobileSidebarOpen(!mobileSidebarOpen);
    };

    const menuItems: MenuItem[] = [
        {
            key: 'admin',
            title: "首页",
            icon: <IconEyeCog className="w-5 h-5" />,
            path: "/admin"
        },
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
        ...(routes?.map(route => ({
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

    const [menus, setMenus] = useState<MenuItem[]>(menuItems);
    const [mergeRoutes, setMergeRoutes] = useState<Route[]>(convertMenuToRoutes(menuItems));

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
        <div className="flex theme-xx min-h-screen bg-gradient-to-br from-gray-100 to-gray-50 dark:bg-black dark:from-black dark:to-black">
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
                <TagView routes={mergeRoutes} />
                <div className="flex-1 overflow-y-auto p-6">
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