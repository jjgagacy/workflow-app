'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useState, useMemo } from 'react';
import { isMatchingPath, Route } from './use-route';

interface Breadcrumb {
    path: string;
    title: string;
}

/**
 * 在路由树中查找路由标题
 * @param routes 路由配置数组
 * @param path 要匹配的路径
 */
function findRouteTitle(routes: Route[], path: string): string {
    for (const route of routes) {
        if (isMatchingPath(route.path, path)) {
            return route.meta?.title || route.title || 'Untitled';
        }
        if (route.children) {
            const childTitle = findRouteTitle(route.children, path);
            if (childTitle) {
                return childTitle;
            }
        }
    }
    return 'Untitled';
}

/**
 * 生成面包屑导航的 Hook
 * @param routes 路由配置
 */
export function useBreadcrumbs(routes: Route[]): Breadcrumb[] {
    const pathname = usePathname();
    const [crumbs, setCrumbs] = useState<Breadcrumb[]>([]);

    // 使用 useMemo 优化路径分割和标题查找
    const breadcrumbs = useMemo(() => {
        if (!pathname) return [];

        const paths = pathname.split('/').filter(Boolean);
        return paths.map((_, index) => {
            const currentPath = '/' + paths.slice(0, index + 1).join('/');
            return {
                path: currentPath,
                title: findRouteTitle(routes, currentPath),
            };
        });
    }, [pathname, routes]);

    // 同步更新面包屑
    useEffect(() => {
        setCrumbs(breadcrumbs);
    }, [breadcrumbs]);

    return crumbs;
}