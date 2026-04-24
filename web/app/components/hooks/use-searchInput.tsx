// useSearchInput.ts
import { useState, useEffect, useCallback, useRef } from 'react';

export interface SearchResult {
  id: string;
  title: string;
  description?: string;
  icon: 'zap' | 'square' | 'grid';
  updatedAt: string;
  category?: string;
}

export interface UseSearchInputProps {
  initialValue?: string;
  onSearch?: (query: string) => Promise<SearchResult[]>;
  onSelect?: (result: SearchResult) => void;
  onClose?: () => void;
  debounceDelay?: number;
  showRecentOnEmpty?: boolean;
  recentData?: SearchResult[];
}

export interface UseSearchInputReturn {
  // 状态
  value: string;
  isLoading: boolean;
  results: SearchResult[];
  selectedIndex: number;
  showResults: boolean;
  isMac: boolean;

  // Refs
  inputRef: React.RefObject<HTMLInputElement | null>;
  containerRef: React.RefObject<HTMLDivElement | null>;
  resultsRef: React.RefObject<HTMLDivElement | null>;

  // 方法
  setValue: (value: string) => void;
  setSelectedIndex: (index: number) => void;
  setShowResults: (show: boolean) => void;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleFocus: (e: React.FocusEvent<HTMLInputElement>) => void;
  handleBlur: (e: React.FocusEvent<HTMLInputElement>) => void;
  handleClose: () => void;
  handleSelectResult: (result: SearchResult) => void;
  performSearch: (query: string) => Promise<void>;
}

// 模拟搜索数据
export const mockSearchData: SearchResult[] = [
  {
    id: '1',
    title: 'Post new deal alerts to Discord',
    description: 'Send automated deal notifications to Discord channels',
    icon: 'zap',
    updatedAt: '4d ago',
    category: 'recently-updated'
  },
  {
    id: '2',
    title: 'Untitled Zap',
    description: '自动化工作流',
    icon: 'zap',
    updatedAt: '4d ago',
    category: 'recently-updated'
  },
  {
    id: '3',
    title: 'Untitled Zap Form',
    description: '表单触发器配置',
    icon: 'square',
    updatedAt: '4d ago',
    category: 'recently-updated'
  },
  {
    id: '4',
    title: 'a fool test page',
    description: '测试页面，用于验证功能',
    icon: 'grid',
    updatedAt: '4d ago',
    category: 'recently-updated'
  },
  {
    id: '5',
    title: 'Sales Analytics Dashboard',
    description: '销售数据分析看板',
    icon: 'grid',
    updatedAt: '2d ago',
    category: 'search-results'
  }
];

export function useSearchInput({
  initialValue = "",
  onSearch,
  onSelect,
  onClose,
  debounceDelay = 300,
  showRecentOnEmpty = true,
  recentData = []
}: UseSearchInputProps = {}): UseSearchInputReturn {
  const [value, setValue] = useState(initialValue);
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<SearchResult[]>(mockSearchData);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [showResults, setShowResults] = useState(false);
  const [isMac, setIsMac] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // 检测是否为 Mac 系统
  useEffect(() => {
    setIsMac(navigator.platform.toUpperCase().indexOf('MAC') >= 0);
  }, []);

  // 执行搜索
  const performSearch = useCallback(async (query: string) => {
    // 如果提供了自定义搜索函数
    if (onSearch) {
      setIsLoading(true);
      setShowResults(true);

      try {
        const searchResults = await onSearch(query);
        setResults(searchResults);
      } catch (error) {
        console.error('Search failed:', error);
        setResults([]);
      } finally {
        setIsLoading(false);
        setSelectedIndex(-1);
      }
      return;
    }

    // 默认行为：显示最近数据
    if (!query.trim() && showRecentOnEmpty) {
      setResults(recentData);
      setShowResults(true);
      return;
    }

    // 如果没有提供搜索函数，清空结果
    if (!onSearch) {
      setResults([]);
      setShowResults(false);
    }
  }, [onSearch, showRecentOnEmpty]);

  // 防抖搜索
  useEffect(() => {
    if (!value.trim()) {
      return;
    }

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      performSearch(value);
    }, debounceDelay);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [value, performSearch, debounceDelay]);

  // 键盘导航
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!showResults) return;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex(prev =>
            prev < results.length - 1 ? prev + 1 : prev
          );
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
          break;
        case 'Enter':
          e.preventDefault();
          if (selectedIndex >= 0 && results[selectedIndex]) {
            handleSelectResult(results[selectedIndex]);
          }
          break;
        case 'Escape':
          e.preventDefault();
          handleClose();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showResults, results, selectedIndex]);

  // 滚动到选中的项
  useEffect(() => {
    if (selectedIndex >= 0 && resultsRef.current) {
      const selectedElement = resultsRef.current.children[selectedIndex] as HTMLElement;
      selectedElement?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  }, [selectedIndex]);

  // 点击外部关闭
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        handleClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    setShowResults(true);
    // 如果值为空且需要显示最近数据，执行搜索
    if (!value.trim() && showRecentOnEmpty) {
      performSearch('');
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    // 延迟关闭，让点击事件有机会执行
    setTimeout(() => {
      if (!containerRef.current?.contains(document.activeElement)) {
        handleClose();
      }
    }, 200);
  };

  const handleClose = () => {
    setShowResults(false);
    setSelectedIndex(-1);
    onClose?.();
  };

  const handleSelectResult = (result: SearchResult) => {
    onSelect?.(result);
    handleClose();
  };

  // 添加全局快捷键监听
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      // 检测 Cmd+K (Mac) 或 Ctrl+K (Windows/Linux)
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault(); // 阻止浏览器默认行为
        e.stopPropagation();

        // 聚焦到搜索框
        inputRef.current?.focus();

        // 可选：选中已有文本
        inputRef.current?.select();
      }

      // 可选：按 ESC 关闭搜索结果
      // if (e.key === 'Escape' && showResults) {
      //   e.preventDefault();
      //   handleClose();
      // }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [inputRef, showResults]);

  return {
    // 状态
    value,
    isLoading,
    results,
    selectedIndex,
    showResults,
    isMac,

    // Refs
    inputRef,
    containerRef,
    resultsRef,

    // 方法
    setValue,
    setSelectedIndex,
    setShowResults,
    handleChange,
    handleFocus,
    handleBlur,
    handleClose,
    handleSelectResult,
    performSearch,
  };
}