import { useState } from 'react';
import { Menu, MenuButton, MenuItems, MenuItem } from '@headlessui/react';
import { ChevronDown, Calendar, ChevronRight } from 'lucide-react';
import clsx from 'clsx';
import { DataTypeKey, FILTER_OPTIONS } from './types';
import { useAppearance } from '@/hooks/use-appearance';
import {
  getThemeActiveClass,
  getThemeHoverClass,
  getThemeSelectedClass,
  getThemeTextClass,
  ThemeType,
} from '@/types/theme';

export default function CascadeFilterMenu() {
  const { activeColorTheme = 'default' } = useAppearance();
  const theme = activeColorTheme as ThemeType;

  // 选中的最终结果
  const [selected, setSelected] = useState({ type: 'date', operator: 'exists' });
  // 当前左侧正在悬停/激活的类型
  const [activeType, setActiveType] = useState<DataTypeKey>('string');

  // 找到当前激活类型的完整配置
  const currentActiveOption = FILTER_OPTIONS.find(o => o.key === activeType);
  // 找到当前选中类型的图标用于外层 Button 展示
  const SelectedIcon = FILTER_OPTIONS.find(o => o.key === selected.type)?.icon || Calendar;

  return (
    <div className="relative inline-block text-left">
      {/* 触发按钮 */}
      <Menu>
        <MenuButton className="inline-flex items-center gap-2 rounded-lg border border-[var(--border)] bg-background px-3 py-1.5 text-sm shadow-sm transition focus:outline-none">
          <SelectedIcon className="h-4 w-4 text-neutral-500" />
          <span>{selected.operator}</span>
          <ChevronDown className="h-3.5 w-3.5 text-neutral-400" />
        </MenuButton>
        {/* 下拉面板外壳 (Headless UI v2 使用 anchor 属性自动定位) */}
        <MenuItems
          anchor="bottom start"
          className="mt-1 flex items-start origin-top-left rounded-xl border border-[var(--border)] bg-background p-1 shadow-xl transition focus:outline-none data-[closed]:scale-95 data-[closed]:opacity-0 duration-100"
        >
          {/* 左侧第一级：数据类型列表 */}
          <div className="w-48 flex flex-col space-y-0.5">
            {FILTER_OPTIONS.map((option) => {
              const Icon = option.icon;
              const isHoveredActive = activeType === option.key;
              const isSelected = selected.type === option.key;

              return (
                <div
                  key={option.key}
                  onMouseEnter={() => setActiveType(option.key)}
                  className={clsx(
                    "flex items-center justify-between rounded-lg px-2.5 py-2 text-sm cursor-pointer select-none transition-colors",
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
              const isCurrentMatch = selected.type === activeType && selected.operator === operator;

              return (
                <MenuItem key={operator}>
                  {({ focus }) => (
                    <button
                      type="button"
                      onClick={() => setSelected({ type: activeType, operator })}
                      className={clsx(
                        "w-full text-left rounded-lg px-3 py-2 text-sm transition-colors block select-none",
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