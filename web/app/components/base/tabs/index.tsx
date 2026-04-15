import { cn } from "@/utils/classnames";
import { Tab, TabGroup, TabList } from "@headlessui/react";
import { Tooltip } from "../tooltip";
import { ChevronLeft, ExternalLink } from "lucide-react";
import React, { useCallback, useEffect } from "react";

interface ExtendedTabOptions<Value> {
  value: Value;
  label?: string;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  tag?: string;
  tooltip?: string;
  href?: string;
  to?: string;
  align?: 'left' | 'center' | 'right';
  variant?: 'default' | 'outline' | 'danger';
  notification?: boolean;
}

interface TabsProps<Value extends string | number> {
  value?: Value;
  options?: Array<ExtendedTabOptions<Value>>;
  size?: 'small' | 'medium' | 'large';
  variant?: 'default' | 'outline';
  onChange?: (value: Value) => void;
  className?: string;
}

export function Tabs<Value extends string | number>({
  value,
  options = [],
  size = 'medium',
  variant = 'default',
  onChange,
  className
}: TabsProps<Value>) {

  const tabsContainerRef = React.useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = React.useState(false);
  const [canScrollRight, setCanScrollRight] = React.useState(false);
  const [scrollPosition, setScrollPosition] = React.useState(0);

  // 检查滚动状态
  const updateScrollState = useCallback(() => {
    const container = tabsContainerRef.current;
    if (container) {
      const { scrollLeft, scrollWidth, clientWidth } = container;
      const canScrollLeft = scrollLeft > 0;
      const canScrollRight = Math.ceil(scrollLeft + clientWidth) < Math.ceil(scrollWidth);

      // 更新滚动按钮的状态
      setScrollPosition(scrollLeft);
      setCanScrollLeft(canScrollLeft);
      setCanScrollRight(canScrollRight);
    }
  }, []);

  // 滚动方法
  const scroll = useCallback((delta: number) => {
    const container = tabsContainerRef.current;
    if (container) {
      container.scrollBy({ left: delta, behavior: 'smooth' });
    }
  }, []);

  const scrollLeft = useCallback(() => scroll(-100), [scroll]);
  const scrollRight = useCallback(() => scroll(100), [scroll]);

  // 监听滚动事件和大小变化
  useEffect(() => {
    const container = tabsContainerRef.current;
    if (!container) return;

    // 监听滚动事件
    const handleScroll = () => {
      updateScrollState();
    };

    // 使用 ResizeObserver 监听容器大小变化
    const resizeObserver = new ResizeObserver(() => {
      updateScrollState();
    });

    container.addEventListener('scroll', handleScroll);
    resizeObserver.observe(container);

    // 初始化滚动状态
    updateScrollState();

    return () => {
      container.removeEventListener('scroll', handleScroll);
      resizeObserver.disconnect();
    };
  }, [updateScrollState]);

  // 当 options 变化时重新检查滚动状态
  useEffect(() => {
    updateScrollState();
  }, [options, updateScrollState]);

  const selectedIndex = value !== undefined ?
    options.findIndex(option => option.value === value)
    : 0;

  const renderTabContent = (option: ExtendedTabOptions<Value>) => (
    <div className="flex items-center gap-1">
      {option.icon && option.iconPosition !== 'right' && (
        option.icon
      )}

      {option.label && (
        <span className="relative inline-flex items-center">
          {option.label}
          {option.notification && (
            <span className="absolute -right-2 top-0">
              <span className="block w-1.5 h-1.5 bg-primary rounded-full" />
            </span>
          )}
        </span>
      )}

      {option.icon && option.iconPosition === 'right' && (
        option.icon
      )}
    </div>
  );

  const renderTab = (option: ExtendedTabOptions<Value>, isSelected: boolean) => {
    const baseClasses = `
      flex items-center gap-1
      px-3 sm:px-4 pt-1
      text-13 font-medium
      whitespace-nowrap
      cursor-pointer
      transition-all duration-200
      focus:outline-none focus:ring-2 focus:ring-primary/20
      hover:text-primary
      ${variant === 'default' ? 'text-xs font-bold px-2 sm:px-3' : ''}
      ${variant === 'outline' ? 'border border-[var(--border)] rounded-md' : ''}
      ${size === 'small' ? 'text-xs' : ''}
      ${!option.label ? 'px-1' : ''}
      ${option.variant === 'danger' ? 'text-destructive hover:text-destructive' : 'text-foreground'}
    `;
    const selectedClasses = isSelected
      ? `text-primary
        border-b-2 border-primary
        ${variant === 'default' ? 'pb-1' : 'pb-1.5 sm:pb-2'}`
      : `border-b-2 border-transparent
        ${variant === 'default' ? 'pb-1' : 'pb-1.5 sm:pb-2'}`;

    const tabContent = renderTabContent(option);

    if (option.href) {
      return (
        <a
          href={option.href}
          target={"_blank"}
          rel="noopener noreferrer"
          className={`${baseClasses} ${selectedClasses}`}
          onClick={() => onChange?.(option.value)}
        >
          {tabContent}
          <ExternalLink className="ml-0.5" size={12} />
        </a>
      );
    }

    return (
      <Tab className={`${baseClasses} ${selectedClasses}`}>{tabContent}</Tab>
    );
  }

  const handleChange = (index: number) => {
    const selectedOption = options[index];
    if (selectedOption && onChange) {
      onChange(selectedOption.value);
    }
  }

  const ScrollButton = ({ direction, onClick }: { direction: 'left' | 'right', onClick: () => void }) => (
    <button
      onClick={onClick}
      className={`
        absolute top-1/2 -translate-y-1/2 z-10
        flex items-center justify-center
        w-6 h-6 rounded-md
        bg-background border border-border
        shadow-sm hover:bg-muted
        transition-all duration-200
        ${direction === 'left' ? 'left-0' : 'right-0'}
      `}
    >
      <ChevronLeft className={direction === 'left' ? '' : 'rotate-180'} size={12} />
    </button>
  );

  return (
    <div className={cn(
      'flex w-full rounded-md bg-background',
      variant === 'outline' ? 'border border-[var(--border)]' : '',
      className
    )}>
      {/* 使用 flex 容器，允许换行或滚动 */}
      <div className="relative flex flex-wrap gap-1 p-2 mr-0 scrollbar-hide w-full">
        {canScrollLeft && (
          <ScrollButton direction="left" onClick={scrollLeft} />
        )}
        {canScrollRight && (
          <ScrollButton direction="right" onClick={scrollRight} />
        )}

        <TabGroup selectedIndex={selectedIndex} onChange={handleChange} className={'w-full'}>
          <div className="relative">
            <TabList ref={tabsContainerRef} className="flex gap-0 sm:gap-1 overflow-hidden">
              {options.map((option, index) => (
                <div
                  key={String(option.value)}
                  className={`relative ${option.align === 'center' ? 'mx-auto' : option.align === 'right' ? 'ml-auto' : ''}`}
                >
                  {option.tooltip ? (
                    <Tooltip content={option.tooltip} placement="right">
                      {renderTab(option, index === selectedIndex)}
                    </Tooltip>
                  ) : (
                    renderTab(option, index === selectedIndex)
                  )}
                </div>
              ))}
            </TabList>
          </div>
        </TabGroup>
      </div>
    </div>
  );
}