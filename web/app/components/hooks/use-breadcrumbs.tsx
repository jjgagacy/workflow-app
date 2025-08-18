'use client';

import { isMatchingPath } from "@/hooks/use-route";
import { Route } from "@/types/route";
import { usePathname } from "next/navigation";
import { useMemo } from "react";

type BreadcrumbItem = {
    title: string;
    link: string;
}

// This allows to add custom title as well
const routeMapping: Record<string, BreadcrumbItem[]> = {
    '/dashboard': [{ title: 'Dashboard', link: '/dashboard' }],
    // add more custom mapping as needed
};

function findRouteTitle(routes: Route[], path: string): string {
    console.log(routes);
    for (const route of routes) {
        // console.log('match', route.path, path);
        if (isMatchingPath(route.path, path)) {
            return route.meta.title || route.title || "Untitled";
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

export function useBreadcrumbs(routes: Route[]): BreadcrumbItem[] {
    const pathname = usePathname();

    const breadcrumbs = useMemo(() => {
        // Check if we have a custom mapping for this exact path
        if (routeMapping[pathname]) {
            return routeMapping[pathname];
        }

        // If no exact match, fall back to generating breadcrumbs from the path
        const segments = pathname.split('/').filter(Boolean);
        return segments.map((segment, index) => {
            const path = `/${segments.slice(0, index + 1).join('/')}`;
            console.log(path);
            return {
                link: path,
                title: findRouteTitle(routes, path)
            } as BreadcrumbItem
        });
    }, [pathname, routes]);

    return breadcrumbs;
}