import { Dialog } from "@/app/ui/dialog"
import { PaletteItem } from "./palette/item";
import { useCallback, useEffect, useRef, useState } from "react";

interface SearchCommandPaletteProps {
  items: PaletteItem[];
  placeholder?: string;
  context?: string;
  isLoading?: boolean;
  onClose?: () => void;
}

export const SearchCommandPalette = ({
  items,
  placeholder = "Type a command or search...",
  context,
  isLoading = false,
  onClose,
}: SearchCommandPaletteProps) => {
  const [inputValue, setInputValue] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [currentParentId, setCurrentParentId] = useState<string | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);
  const paletteRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const currentParent = items.find(item => item.id === currentParentId);
  const currentItems = currentParent?.children ?? items;
  const currentPlaceholder = currentParent?.placeholder ?? placeholder;

  // 过滤命令项
  const filteredItems = currentItems.filter(item => {
    if (!inputValue) return true;

    const query = inputValue.toLowerCase();
    const searchText = [
      typeof item.title === 'string' ? item.title : '',
      ...(item.keywords ?? [])
    ].filter(Boolean).join(' ').toLowerCase();

    if (item.matchAnySearchTerm) {
      return query.split(' ').filter(Boolean).some(word => searchText.includes(word));
    }
    return searchText.includes(query);
  });

  // 分组
  const groupedItems = {
    ungrouped: filteredItems.filter(item => !item.section),
    sections: filteredItems.reduce((acc, item) => {
      if (item.section) {
        if (!acc[item.section]) acc[item.section] = [];
        acc[item.section].push(item);
      }
      return acc;
    }, {} as Record<string, PaletteItem[]>)
  };

  // 扁平化列表用于索引
  const flattenedItems = [
    ...groupedItems.ungrouped,
    ...Object.values(groupedItems.sections).flat()
  ];

  const openPalette = useCallback(() => {
    setInputValue('');
    setSelectedIndex(0);
    setCurrentParentId(null);
  }, []);

  const closePalette = useCallback(() => {
    setInputValue('');
    setSelectedIndex(0);
    setCurrentParentId(null);
    onClose?.();
  }, [onClose]);

  // 进入子菜单
  const navigateToChildren = useCallback((item: PaletteItem) => {
    setCurrentParentId(item.id);
    setSelectedIndex(0);
    setInputValue('');
  }, []);

  // 选择命令
  const selectItem = useCallback((item: PaletteItem) => {
    if (item.children) {
      navigateToChildren(item);
      return;
    }
    if (item.handler) {
      item.handler();
    }
    console.log('Selected command:', item.title);
    closePalette();
  }, [navigateToChildren, closePalette]);

  // 返回上一级
  const navigateBack = useCallback(() => {
    setCurrentParentId(null);
    setSelectedIndex(0);
    setInputValue('');
  }, []);

  // 滚动到选中项
  const scrollSelectedIntoView = useCallback(() => {
    if (selectedIndex < 0) return;

    const selectedItem = flattenedItems[selectedIndex];
    if (!selectedItem) return;

    const selectedElement = document.querySelector(`[data-palette-item="${selectedItem.id}"]`);
    if (selectedElement) {
      selectedElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [selectedIndex, flattenedItems]);

  // 键盘事件处理
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
      event.preventDefault();
      openPalette();
      return;
    }

    event.stopPropagation();

    switch (event.key) {
      case 'Escape':
        event.preventDefault();
        closePalette();
        break;
      case 'ArrowDown':
        event.preventDefault();
        setSelectedIndex(prev => Math.min(prev + 1, flattenedItems.length - 1));
        scrollSelectedIntoView();
        break;
      case 'ArrowUp':
        event.preventDefault();
        setSelectedIndex(prev => Math.max(prev - 1, 0));
        scrollSelectedIntoView();
        break;
      case 'ArrowLeft':
        if (!inputValue && currentParent) {
          event.preventDefault();
          navigateBack();
        }
        break;
      case 'ArrowRight':
        if (selectedIndex >= 0 && flattenedItems[selectedIndex]?.children) {
          event.preventDefault();
          navigateToChildren(flattenedItems[selectedIndex]);
        }
        break;
      case 'Enter':
        event.preventDefault();
        if (selectedIndex >= 0 && flattenedItems[selectedIndex]) {
          selectItem(flattenedItems[selectedIndex]);
        }
        break;
    }
  }, [flattenedItems, selectedIndex, currentParent, inputValue, openPalette, closePalette, navigateBack, navigateToChildren, selectItem, scrollSelectedIntoView]);

  // 点击外部关闭
  const handleClickOutside = useCallback((event: MouseEvent) => {
    if (paletteRef.current && !paletteRef.current.contains(event.target as Node)) {
      closePalette();
    }
  }, [closePalette]);

  // 注册全局事件
  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('click', handleClickOutside);
    };
  }, [handleKeyDown, handleClickOutside]);

  // 更新选中索引当输入变化时
  useEffect(() => {
    setSelectedIndex(0);
  }, [inputValue]);

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh]">
      <div
        ref={paletteRef}
        className="bg-background rounded-md shadow-md w-full max-w-[600px] border border-[var(--border)]"
      >
        {context && (
          <div className="px-2 pt-2">
            <span className="inline-flex items-center rounded-md bg-neutral-100 dark:bg-neutral-700 px-2 py-0.5 text-xs font-medium text-neutral-600 dark:text-neutral-300">
              {context}
            </span>
          </div>
        )}

        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={currentPlaceholder}
            className="w-full h-12 px-4 pr-10 bg-transparent border-b border-neutral-200 dark:border-neutral-700 outline-none text-sm text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-500"
            autoFocus
          />
          {isLoading && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <div className="w-4 h-4 border-2 border-neutral-300 border-t-neutral-600 rounded-full animate-spin" />
            </div>
          )}
        </div>

        {/* Results */}
        <div className="max-h-[350px] overflow-y-auto p-2" ref={scrollAreaRef}>
          {/* 无结果显示 */}
          {inputValue && filteredItems.length === 0 && !isLoading && (
            <div className="py-8 text-center text-sm text-neutral-500">
              No results found
            </div>
          )}

          {/* 加载中 */}
          {isLoading && (
            <div className="space-y-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-10 animate-pulse bg-neutral-100 dark:bg-neutral-700 rounded" />
              ))}
            </div>
          )}

          {!isLoading && filteredItems.length > 0 && (
            <div className="space-y-1">
              {/* 未分组 */}
              {groupedItems.ungrouped.map((item, index) => (
                <PaletteItem
                  key={item.id}
                  item={item}
                  isSelected={flattenedItems.indexOf(item) === selectedIndex}
                  onSelect={() => selectItem(item)}
                />
              ))}

              {/* 分组 */}
              {Object.entries(groupedItems.sections).map(([title, sectionItems]) => (
                <div key={title}>
                  <div className="px-2 py-1 text-xs font-medium text-neutral-500 dark:text-neutral-400">
                    {title}
                  </div>
                  {sectionItems.map(item => (
                    <PaletteItem
                      key={item.id}
                      item={item}
                      isSelected={flattenedItems.indexOf(item) === selectedIndex}
                      onSelect={() => selectItem(item)}
                    />
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}