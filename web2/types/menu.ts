import { ReactNode } from "react";
import { RouteMeta } from "./route";

export interface BaseMenuItem {
  key: string;
  title: string;  // This is required for all menu items
  icon?: ReactNode;
  path?: string;
  meta?: RouteMeta;
  fetched?: boolean;
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
