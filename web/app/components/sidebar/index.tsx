'use client';

import { Menu } from "lucide-react";
import Image from "next/image";
import { ReactNode } from "react";
import { useCustomTheme } from "../provider/customThemeProvider";
import { getThemeHoverClass, ThemeType } from "@/types/theme";
import { Monie } from "../base/monie";
import { useAppearance } from "@/hooks/use-appearance";

interface SidebarProps {
  collapsed: boolean;
  onToggleCollapse: (data: boolean) => void;
  children: ReactNode;
}

export function Sidebar({ collapsed, onToggleCollapse, children }: SidebarProps) {
  const { activeTheme, activeColorTheme, darkmode } = useCustomTheme();
  return (
    <aside className="fixed left-0 top-0 h-screen">
      <div className="flex relative bg-gray-100 flex-col">
        <div
          className={`bg-background h-screen shadow-md transition-all duration-300 ease-in-out ${collapsed ? "w-20" : "w-64"
            }`}
        >
          {/* Header with logo and collapse button */}
          <div className={`flex items-center ${collapsed ? 'justify-center' : 'justify-between'} p-4 border-b border-[var(--border)] shrink-0 h-[3rem]`}>
            {!collapsed && (
              <div className="flex items-center">
                <Image
                  src={`${darkmode ? "/assets/logo-dark.png" : "/assets/logo.png"}`}
                  alt="Monie Logo"
                  width={40}
                  height={40}
                  priority
                  className="h-6 w-6 mr-2"
                />
                <Monie width={56} height={24} darkmode={darkmode} />
              </div>
            )}
            <button
              onClick={() => onToggleCollapse(!collapsed)}
              className={`p-2 rounded-full group ${getThemeHoverClass(activeColorTheme as ThemeType)}`}
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {/* 展开时显示 Menu 图标 */}
              {!collapsed ? (
                <Menu className="w-5 h-5" />
              ) : (
                /* 收起时默认显示 Logo，hover 时显示 Menu */
                <>
                  {/* 默认显示的 Logo */}
                  <Image
                    src={`${darkmode ? "/assets/logo-dark.png" : "/assets/logo.png"}`}
                    alt="Monie Logo"
                    width={32}
                    height={32}
                    className="w-6 h-6 group-hover:hidden block"
                  />
                  {/* hover 时显示的 Menu 图标 */}
                  <Menu className="w-5 h-5 hidden group-hover:block" />
                </>
              )}
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