'use client';

import { usePathname } from 'next/navigation';

// 类型定义
interface RouteMeta {
    title?: string;
    [key: string]: any;
}

export interface Route {
    path: string;
    meta?: RouteMeta;
    title?: string;
    children?: Route[];
}

/**
 * 检查路由路径是否匹配当前路径
 * @param routePath 路由定义的路径 (如 '/users/:id')
 * @param currentPath 当前路径 (如 '/users/123')
 */
export function isMatchingPath(routePath: string, currentPath: string): boolean {
    const routeParts = routePath.split('/').filter(part => part);
    const targetParts = currentPath.split('/').filter(part => part);

    if (routeParts.length !== targetParts.length) {
        return false;
    }

    for (let i = 0; i < routeParts.length; i++) {
        if (routeParts[i].startsWith(':')) continue;
        if (routeParts[i] !== targetParts[i]) return false;
    }
    return true;
}

/**
 * 在路由树中查找匹配的路由
 * @param routes 路由数组
 * @param path 要匹配的路径
 */
export function findRoute(routes: Route[], path: string): Route | null {
    for (const route of routes) {
        if (isMatchingPath(route.path, path)) {
            return route;
        }
        if (route.children) {
            const childRoute = findRoute(route.children, path);
            if (childRoute) {
                return childRoute;
            }
        }
    }
    return null;
}

/**
 * 获取当前路由的 Hook
 * @param routes 路由配置
 */
export function useCurrentRoute(routes: Route[]): Route | null {
    const pathname = usePathname();
    return findRoute(routes, pathname || '');
}

/**
 * 获取路由标题
 * @param routes 路由配置
 * @param path 路径
 */
export function getRouteTitle(routes: Route[], path: string): string {
    const route = findRoute(routes, path);
    return route ? route.meta?.title || route.title || "Untitled" : "Not Found";
}

/**
 * 获取当前路由标题的 Hook
 * @param routes 路由配置
 */
export function useCurrentRouteTitle(routes: Route[]): string {
    const pathname = usePathname();
    return getRouteTitle(routes, pathname || '');
}
