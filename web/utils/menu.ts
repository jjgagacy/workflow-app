import { isParentMenuItem, MenuItem } from "@/types/menu";
import { BaseRoute, LeafRoute, ParentRoute, Route } from "@/types/route";

export function convertMenuToRoutes(menuItems: MenuItem[]): Route[] {
  return menuItems.map(convertMenuItemToRoute);
}

function convertMenuItemToRoute(menuItem: MenuItem): Route {
  const baseRoute: BaseRoute = {
    key: menuItem.key,
    title: menuItem.title,
    path: menuItem.path || menuItem.key, // fallback to key if path not provided
    meta: menuItem.meta || {
      title: menuItem.title,
      hidden: false,
      requiresAuth: false,
      breadcrumb: true
    }
  };

  if (isParentMenuItem(menuItem) && menuItem.children) {
    const parentRoute: ParentRoute = {
      ...baseRoute,
      icon: menuItem.icon,
      children: menuItem.children.map(convertMenuItemToRoute)
    };
    return parentRoute;
  }

  const leafRoute: LeafRoute = {
    ...baseRoute,
    icon: menuItem.icon,
    component: undefined
  };
  return leafRoute;
}

interface MatchResult {
  route: Route;
  weight: number; // 匹配权重
}

export const findMatchingRoute = (routes: Route[], targetPath: string): Route | null => {
  let bestMatch: MatchResult | null = null;

  const evaluateMatch = (route: Route): MatchResult | null => {
    if (!route.path) return null;

    const isExactMatch = route.path === targetPath;
    const isPrefixMatch = targetPath.startsWith(route.path + '/') ||
      (targetPath.startsWith(route.path) && targetPath.length > route.path.length);

    if (isExactMatch) {
      // 精确匹配权重最高
      return { route, weight: Number.MAX_SAFE_INTEGER };
    }

    if (isPrefixMatch) {
      // 前缀匹配，路径越长权重越高
      return { route, weight: route.path.length };
    }

    return null;
  };

  for (const route of routes) {
    // 检查当前路由
    const currentMatch = evaluateMatch(route);
    if (currentMatch && (!bestMatch || currentMatch.weight > bestMatch.weight)) {
      bestMatch = currentMatch;
    }

    // 递归检查子路由
    if (route.children) {
      const childMatch = findMatchingRoute(route.children, targetPath);
      if (childMatch) {
        const childWeight = childMatch.path?.length || 0;
        if (!bestMatch || childWeight > bestMatch.weight) {
          bestMatch = { route: childMatch, weight: childWeight };
        }
      }
    }
  }

  return bestMatch?.route || null;
};

