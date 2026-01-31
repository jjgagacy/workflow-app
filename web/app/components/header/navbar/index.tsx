'use client';

import { IconPercentage50 } from "@tabler/icons-react";
import { Breadcrumbs } from "./breadcrumbs";
import { Route } from "@/types/route";
import { ThemeSelector } from "./selector/theme-selector";
import { useIsMobile } from "@/hooks/use-mobile";
import { UserSelector } from "./selector/user-selector";
import { LanguageSelector } from "./selector/language-selector";
import { useAppearance } from "@/hooks/use-appearance";

interface NavbarProps {
  routes: Route[];
  onMenuClick?: () => void;
}

export function Navbar({ routes, onMenuClick }: NavbarProps) {
  const isMobile = useIsMobile();
  const { toggleTheme } = useAppearance();

  return (
    <div className="bg-background shadow-sm dark:shadow-gray-700/30 flex items-center rounded-lg mr-2">
      {/* 移动端菜单按钮 */}
      {onMenuClick && (
        <button
          onClick={onMenuClick}
          className="md:hidden mr-4 p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      )}

      {/* 其他 Navbar 内容 */}
      <div className="flex-1">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex h-[3rem]">
            {/* Left navigation (optional) */}
            {!isMobile && (
              <div className="flex flex-1 items-center">
                <Breadcrumbs routes={routes} />
              </div>
            )}
            {/* Right user info */}
            <div className={`flex items-center ${isMobile ? 'flex-1 justify-end' : ''}`}>
              <LanguageSelector reloadPage={true} />
              <ThemeSelector />
              <button
                type="button"
                className="p-1 mr-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none"
                onClick={toggleTheme}
              >
                <span className="sr-only">View notifications</span>
                <IconPercentage50 className="h-6 w-6" aria-hidden="true" />
              </button>
              <UserSelector />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}