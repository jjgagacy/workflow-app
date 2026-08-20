import { useState, useEffect } from 'react';
import { Menu, MenuButton, MenuItems, MenuItem } from '@headlessui/react';
import { ChevronDown, Calendar, ChevronRight } from 'lucide-react';
import clsx from 'clsx';
import { useAppearance } from '@/hooks/use-appearance';
import {
  getThemeActiveClass,
  getThemeHoverClass,
  getThemeSelectedClass,
  getThemeTextClass,
  ThemeType,
} from '@/types/theme';
import { CascadeFilterOption, CascadeFilterValue } from './types';
import { cn } from '@/utils/classnames';

interface CascadeFilterMenuProps {
  /** 当前选中的值 */
  value: CascadeFilterValue;
  /** 值改变时的回调函数 */
  onChange: (value: CascadeFilterValue) => void;
  /** 下拉菜单的数据源配置 */
  options: CascadeFilterOption[];
  /** 当未匹配到图标时的默认后备图标 */
  defaultIcon?: typeof Calendar;
  className?: string;
}

export default function CascadeFilterMenu({
  value,
  onChange,
  options,
  defaultIcon: DefaultIcon = Calendar,
  className,
}: CascadeFilterMenuProps) {
  const { activeColorTheme = 'default' } = useAppearance();
  const theme = activeColorTheme as ThemeType;

  // 当前左侧正在悬停/激活的二级分类类型（默认为当前选中值，避免打开时右侧显示错位）
  const [activeType, setActiveType] = useState<string>(value.type);

  // 当外部传入的选值发生变化时，同步重置左侧的激活状态
  useEffect(() => {
    if (value.type) {
      setActiveType(value.type);
    }
  }, [value.type]);

  // 找到当前鼠标悬停/激活类型的完整配置
  const currentActiveOption = options.find(o => o.key === activeType);

  // 找到当前选中类型的图标用于外层 Button 展示
  const SelectedIcon = options.find(o => o.key === value.type)?.icon || DefaultIcon;

  return (
    <div className={cn("relative inline-flex text-left z-50", className)}>
      <Menu as="div" className="relative h-full">
        {/* 触发按钮 */}
        <MenuButton className="inline-flex h-full min-h-[38px] items-center gap-2 rounded-md border border-[var(--border)] bg-background px-3 py-1.5 text-sm whitespace-nowrap focus:outline-none hover:bg-muted/10">
          <SelectedIcon className="h-4 w-4 text-neutral-500" />
          <span>{value.operator || 'Select operator'}</span>
          <ChevronDown className="ml-auto h-3.5 w-3.5 text-neutral-400" />
        </MenuButton>

        {/* 下拉面板外壳 (Headless UI v2 使用 anchor 属性自动定位) */}
        <MenuItems
          anchor="bottom start"
          className="mt-1 flex items-start origin-top-left rounded-md border border-[var(--border)] bg-background p-1 shadow-xl transition focus:outline-none data-[closed]:scale-95 data-[closed]:opacity-0 duration-100 z-[99]"
        >
          {/* 左侧第一级：数据类型列表 */}
          <div className="w-48 flex flex-col space-y-0.5">
            {options.map((option) => {
              const Icon = option.icon;
              const isHoveredActive = activeType === option.key;
              const isSelected = value.type === option.key;

              return (
                <div
                  key={option.key}
                  onMouseEnter={() => setActiveType(option.key)}
                  className={clsx(
                    "flex items-center justify-between rounded-md px-2.5 py-2 text-sm cursor-pointer select-none transition-colors",
                    getThemeTextClass(theme),
                    isHoveredActive && getThemeHoverClass(theme),
                    isSelected && !isHoveredActive && [getThemeSelectedClass(theme), getThemeActiveClass(theme), 'font-medium']
                  )}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon
                      className={clsx(
                        "h-4 w-4",
                        getThemeTextClass(theme),
                        isSelected && !isHoveredActive && getThemeActiveClass(theme)
                      )}
                    />
                    <span>{option.name}</span>
                  </div>
                  <ChevronRight className="h-3.5 w-3.5 text-neutral-400" />
                </div>
              );
            })}
          </div>

          {/* 右侧第二级：操作符列表 */}
          <div className="w-52 border-l border-[var(--border)] pl-1 flex flex-col space-y-0.5 min-h-[240px]">
            {currentActiveOption?.operators.map((operator) => {
              const isCurrentMatch = value.type === activeType && value.operator === operator;

              return (
                <MenuItem key={operator}>
                  {({ focus }) => (
                    <button
                      type="button"
                      onClick={() => onChange({ type: activeType, operator })}
                      className={clsx(
                        "w-full text-left rounded-lg px-3 py-2 text-sm transition-colors block select-none focus:outline-none",
                        getThemeTextClass(theme),
                        focus && getThemeHoverClass(theme),
                        isCurrentMatch && [getThemeSelectedClass(theme), getThemeActiveClass(theme), 'font-medium']
                      )}
                    >
                      {operator}
                    </button>
                  )}
                </MenuItem>
              );
            })}
          </div>
        </MenuItems>
      </Menu>
    </div>
  );
}