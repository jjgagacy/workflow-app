import { ReactNode } from "react";

export interface RouteMeta {
  title: string;
  hidden?: boolean;
  requiresAuth?: boolean;
  roles?: string[];
  breadcrumb?: boolean;
}

export interface BaseRoute {
  key: string;
  title: string;
  path: string;
  meta: RouteMeta;
}

export interface ParentRoute extends BaseRoute {
  children?: Route[];
  icon?: ReactNode;
  component?: React.ComponentType;
}

export interface LeafRoute extends BaseRoute {
  icon?: ReactNode;
  component?: React.ComponentType;
}

export type Route = ParentRoute & LeafRoute;

// 类型守卫
export function isParentRoute(route: Route): route is ParentRoute {
  return 'children' in route && Array.isArray(route.children);
}
