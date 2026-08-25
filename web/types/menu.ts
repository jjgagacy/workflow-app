import { ComponentType, createElement, isValidElement, ReactNode } from "react";
import { RouteMeta } from "./route";

export const DEFAULT_MENU_ICON_CLASS_NAME = "w-5 h-5";

export type MenuIcon = ComponentType<{ className?: string; size?: number | string }> | ReactNode;

function isRenderableIconComponent(value: unknown): value is ComponentType<{ className?: string; size?: number | string }> {
  if (typeof value === 'function') return true;
  return !!value && typeof value === 'object' && '$$typeof' in value && 'render' in value;
}

export function renderMenuIcon(icon: MenuIcon | undefined, className = DEFAULT_MENU_ICON_CLASS_NAME): ReactNode {
  if (!icon) return null;

  if (isValidElement(icon)) {
    return icon;
  }

  if (isRenderableIconComponent(icon)) {
    return createElement(icon, { className });
  }

  return icon;
}

export interface BaseMenuItem {
  key: string;
  title: string;  // This is required for all menu items
  icon?: MenuIcon;
  className?: string;
  iconClassName?: string;
  path?: string;
  meta?: RouteMeta;
  fetched?: boolean;
}

export function resolveMenuIconClassName(item: Pick<BaseMenuItem, 'className' | 'iconClassName'> | undefined, fallback = DEFAULT_MENU_ICON_CLASS_NAME): string {
  if (!item) return fallback;
  return item.iconClassName || item.className || fallback;
}

export interface ParentMenuItem extends BaseMenuItem {
  children?: MenuItem[];  // Note: Using MenuItem here creates a recursive type
}

export interface LeafMenuItem extends BaseMenuItem {
  // No children property for leaf nodes
}

// The main MenuItem type can be either Parent or Leaf
export type MenuItem = ParentMenuItem & LeafMenuItem;

// Type guard to check if a menu item is a parent
export function isParentMenuItem(item: MenuItem): item is ParentMenuItem {
  return 'children' in item && Array.isArray(item.children);
}
