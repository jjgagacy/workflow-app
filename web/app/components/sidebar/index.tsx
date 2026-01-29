'use client';

import { Menu } from "lucide-react";
import Image from "next/image";
import { ReactNode } from "react";
import { useActiveAppearance } from "../appearance";
import { getThemeHoverClass, ThemeType } from "@/types/theme";

interface SidebarProps {
  collapsed: boolean;
  onToggleCollapse: (data: boolean) => void;
  children: ReactNode;
}

export function Sidebar({ collapsed, onToggleCollapse, children }: SidebarProps) {
  const { activeAppearance: activeTheme } = useActiveAppearance();
  return (
    <aside className="fixed left-0 top-0 h-screen">
      <div className="flex relative bg-gray-100 flex-col">
        <div
          className={`bg-background h-screen shadow-md transition-all duration-300 ease-in-out ${collapsed ? "w-20" : "w-64"
            }`}
        >
          {/* Header with logo and collapse button */}
          <div className={`flex items-center ${collapsed ? 'justify-center' : 'justify-between'} p-4 border-b border-[var(--border)] shrink-0 h-[3rem]`}>
            {!collapsed && <Image
              src="/assets/logo.png"
              alt="Monie Logo"
              width={40}
              height={40}
              priority
              className="h-6 w-6"
            />}
            <button
              onClick={() => onToggleCollapse(!collapsed)}
              className={`p-2 rounded-full ${getThemeHoverClass(activeTheme as ThemeType)}`}
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation content area */}
          <div className="flex-1 h-[calc(100vh-3rem)] relative overflow-y-auto no-scrollbar">
            {children}
          </div>
        </div>
      </div>
    </aside>
  );
}