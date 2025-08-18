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
import { convertMenuToRoutes } from "@/utils/menu";
import Keepalive from "../components/header/keepalive";
import { usePathname, useRouter } from "next/navigation";
import { useTagsView } from "@/hooks/use-tagview";
import { ViewProvider } from "../components/hooks/use-view";

interface AdminLayoutProps {
    children: ReactNode;
    routes?: Route[];
}

export default function AdminLayout({ children, routes, ...rest }: AdminLayoutProps) {
    const [isCollapsed, setIsCollapsed] = usePersistentState("sidebarExpanded", false);
    const { tags: aliveList, addTag, include } = useTagsView();
    const router = useRouter();
    const pathname = usePathname();

    // console.log(include, aliveList, '---------------');

    const menuItems: MenuItem[] = [
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

    const handleChildEvent = (data: boolean) => {
        setIsCollapsed(data);
    }

    // 获取当前匹配的路由
    const matchRoute = useMemo(() => {
        // Recursive function to search through routes and their children
        const findMatchingRoute = (routes: Route[], targetPath: string): Route | null => {
            for (const route of routes) {
                // Check if current route matches
                // console.log(route.path, targetPath, '))')
                if (route.path === targetPath) {
                    // console.log(route, '::')
                    return route;
                }
                // If route has children, search recursively
                if (route.children) {
                    const foundInChildren = findMatchingRoute(route.children, targetPath);
                    if (foundInChildren) {
                        return foundInChildren;
                    }
                }
            }
            return null;
        };
        return findMatchingRoute(mergeRoutes, pathname);
    }, [pathname, mergeRoutes]);

    // 渲染当前路由对应的组件
    // const renderCurrentRoute = useMemo(() => {
    //     if (!mergeRoutes) return null;

    //     if (!matchRoute.component) return null;
    //     const MatchedComponent = matchRoute.component;
    //     return (
    //         <ViewProvider value={{ name: matchRoute.key }}>
    //             <MatchedComponent key={matchRoute.key} />
    //         </ViewProvider>
    //     );
    // }, [mergeRoutes]);

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

    return (
        <div className="flex min-h-screen bg-gradient-to-br from-gray-100 to-gray-50">
            <Sidebar onToggleCollapse={handleChildEvent} collapsed={isCollapsed}>
                <Navigation collapsed={isCollapsed} routes={mergeRoutes} />
            </Sidebar>
            <div className={`flex-1 flex flex-col overflow-x-auto transition-all ${isCollapsed ? 'ml-32' : 'ml-64'}`}>
                <Navbar />
                <TagView routes={mergeRoutes} aliveList={aliveList} />
                <div className="flex-1 overflow-y-auto p-4">
                    <Keepalive
                        active={matchRoute === null ? null : matchRoute.key}
                        include={include}
                        isAsyncInclude
                    >
                        <ViewProvider value={{ name: matchRoute?.key || '' }}>
                            {children}
                        </ViewProvider>
                    </Keepalive>
                    {/* <Breadcrumb /> */}
                </div>
            </div>
        </div>
    );
}