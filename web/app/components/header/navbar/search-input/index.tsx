import React, { } from 'react';
import { SearchResult } from './search-result';
import { useSearchInput, UseSearchInputProps } from '@/app/components/hooks/use-searchInput';

interface SearchInputProps {
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  onFocus?: (e: React.FocusEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  onClose?: () => void;
  onSelect?: (result: SearchResult) => void;
  ariaLabel?: string;
  className?: string;
  // 新增：自定义搜索函数
  onSearch?: UseSearchInputProps['onSearch'];
  // 新增：最近数据
  recentData?: UseSearchInputProps['recentData'];
  // 新增：防抖延迟
  debounceDelay?: number;
}

export const SearchInput = function ({
  placeholder = "Search apps, tables, and more",
  value: externalValue,
  onChange: externalOnChange,
  onClose,
  onFocus,
  onBlur,
  onSelect,
  onSearch,
  recentData = [],
  debounceDelay = 300,
  ariaLabel = "Search apps, tables, and more",
  className = ""
}: SearchInputProps) {
  const {
    value,
    isLoading,
    results,
    selectedIndex,
    showResults,
    isMac,
    inputRef,
    containerRef,
    resultsRef,
    handleChange,
    handleFocus,
    handleBlur,
    handleSelectResult,
    setSelectedIndex,
  } = useSearchInput({
    initialValue: externalValue,
    onSearch,
    onSelect,
    onClose,
    debounceDelay,
    recentData,
  });

  // 同步外部 value
  React.useEffect(() => {
    if (externalValue !== undefined && externalValue !== value) {
      handleChange({ target: { value: externalValue } } as any);
    }
  }, [externalValue]);

  // 同步外部 onChange
  const onChangeHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleChange(e);
    externalOnChange?.(e.target.value);
  };

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      {/* 搜索输入框容器 */}
      <div className="relative flex items-center w-full">
        {/* 搜索图标 */}
        <div className="absolute left-3 flex items-center pointer-events-none">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="text-gray-400 dark:text-gray-500"
            aria-hidden="true"
            role="img"
            data-name="navSearch"
          >
            <path
              d="M5.13405 17.4518L2.2915 20.2943L3.7057 21.7085L6.54825 18.866L5.13405 17.4518Z"
              fill="currentColor"
            />
            <path
              d="M13 3C8.59 3 5 6.59 5 11C5 14.75 7.98 19 13 19C17.41 19 21 15.41 21 11C21 6.59 17.41 3 13 3ZM13 17C9.2 17 7 13.79 7 11C7 7.69 9.69 5 13 5C16.31 5 19 7.69 19 11C19 14.31 16.31 17 13 17Z"
              fill="currentColor"
            />
          </svg>
        </div>

        {/* 搜索输入框 */}
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={onChangeHandler}
          onFocus={(e) => {
            handleFocus(e);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            handleBlur(e);
            onBlur?.(e);
          }}
          placeholder={placeholder}
          aria-label={ariaLabel}
          role="combobox"
          aria-expanded={showResults}
          aria-haspopup="listbox"
          aria-controls="global-search-listbox"
          autoComplete="off"
          className="w-full pl-10 pr-24 py-2.5 bg-background border border-[var(--border)] rounded-lg 
            text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 text-sm
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
            transition-all duration-200"
        />

        {/* 快捷键覆盖层 */}
        <div className="absolute right-3 flex items-center gap-1 pointer-events-none">
          <kbd className="px-1.5 py-0.5 text-xs font-mono font-medium text-gray-500 dark:text-gray-400 bg-muted 
         border border-[var(--border)] rounded-md shadow-sm">
            {isMac ? '⌘' : 'Ctrl'}
          </kbd>
          <kbd className="px-1.5 py-0.5 text-xs font-mono font-medium text-gray-500 dark:text-gray-400 bg-muted 
         border border-[var(--border)] rounded-md shadow-sm">
            K
          </kbd>
        </div>
      </div>

      {showResults && (
        <SearchResult
          results={results}
          selectedIndex={selectedIndex}
          handleSelectResult={handleSelectResult}
          setSelectedIndex={setSelectedIndex}
          isLoading={isLoading}
          resultsRef={resultsRef}
          value={value}
        />
      )}
    </div>
  );
};
