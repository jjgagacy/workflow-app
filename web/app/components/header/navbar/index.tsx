'use client';

import { IconPercentage50 } from "@tabler/icons-react";
import { Breadcrumbs } from "./breadcrumbs";
import { Route } from "@/types/route";
import { ThemeSelector } from "./selector/theme-selector";
import { useIsMobile } from "@/hooks/use-mobile";
import { UserSelector } from "./selector/user-selector";
import { LanguageSelector } from "./selector/language-selector";
import { useAppearance } from "@/hooks/use-appearance";
import { PercentCircle, SunMoon, SunMoonIcon } from "lucide-react";
import { SearchInput } from "./search-input";
import { useCallback, useState } from "react";
import { mockSearchData } from "../../hooks/use-searchInput";

interface NavbarProps {
  routes: Route[];
  onMenuClick?: () => void;
}

export function Navbar({ routes, onMenuClick }: NavbarProps) {
  const isMobile = useIsMobile();
  const { toggleTheme } = useAppearance();
  const [searchValue, setSearchValue] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const handleSearch = useCallback(async (query: string) => {
    console.log('Performing search for:', query);
    // 这里可以调用实际的搜索 API，当前使用模拟数据
    return mockSearchData;
  }, []);

  return (
    <div className="dark:shadow-gray-700/30 flex items-center rounded-lg mr-2">
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
        <div className="px-4 sm:px-2 lg:px-4">
          <div className="flex h-[3.5rem]">
            {/* Left navigation (optional) */}
            {!isMobile && (
              <div className="flex flex-1 items-center mr-2">
                {/* <Breadcrumbs routes={routes} /> */}
                <SearchInput
                  value={searchValue}
                  onChange={setSearchValue}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                  // recentData={mockSearchData}
                  onSearch={handleSearch}
                />
              </div>
            )}
            {/* Right user info */}
            <div className={`flex items-center text-component ${isMobile ? 'flex-1 justify-end' : ''}`}>
              <LanguageSelector reloadPage={true} />
              <ThemeSelector />
              <button
                type="button"
                className="p-1 mx-2 rounded-full focus:outline-none text-text-primary"
                onClick={toggleTheme}
              >
                <span className="sr-only">View notifications</span>
                <SunMoon className="h-5 w-5" aria-hidden="true" />
              </button>
              <UserSelector />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}