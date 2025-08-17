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