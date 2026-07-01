'use client';

import { Route } from "@/types/route";
import { ThemeSelector } from "./selector/theme-selector";
import { UserSelector } from "./selector/user-selector";
import { LanguageSelector } from "./selector/language-selector";
import { SearchInput } from "./search-input";
import { useCallback, useState } from "react";
import { mockSearchData } from "../../hooks/use-searchInput";
import { useSidebar } from "../../hooks/use-sidebar";
import { ThemeToggleButton } from "./theme-toggle-button";

interface NavbarProps {
  routes: Route[];
  onMenuClick?: () => void;
}

export function Navbar({ routes, onMenuClick }: NavbarProps) {
  const [searchValue, setSearchValue] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const handleSearch = useCallback(async (query: string) => {
    console.log('Performing search for:', query);
    // 这里可以调用实际的搜索 API，当前使用模拟数据
    return mockSearchData;
  }, []);

  const { isMobile } = useSidebar();

  const handleMenuClick = () => {
    onMenuClick?.();
  };

  return (
    <div className="dark:shadow-gray-700/30 flex items-center rounded-lg mr-2">
      {/* 移动端菜单按钮 */}
      <button
        onClick={handleMenuClick}
        className="md:hidden mr-4 p-2 ml-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* 其他 Navbar 内容 */}
      <div className="flex-1">
        <div className="px-4 sm:px-2 lg:px-4">
          <div className="flex h-[3.5rem]">
            {/* Left navigation (optional) */}
            {!isMobile && (
              <div className="flex flex-1 items-center mr-2">
                <SearchInput
                  value={searchValue}
                  onChange={setSearchValue}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                  onSearch={handleSearch}
                />
              </div>
            )}
            {/* Right user info */}
            <div className={`flex items-center text-component ${isMobile ? 'flex-1 justify-end' : ''}`}>
              <LanguageSelector reloadPage={true} />
              <ThemeSelector />
              <ThemeToggleButton />
              <UserSelector />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}