import { forwardRef, ReactNode, useState } from "react";
import { PopoverDirection } from "./types";
import { Popover as HeadlessPopover, PopoverButton, PopoverPanel, PopoverPanelProps } from '@headlessui/react';
import { cn } from "@/utils/classnames";

export interface PopoverProps {
  /** 触发按钮，支持通过 render prop 获取 open 状态 */
  trigger: ReactNode | ((props: { open: boolean }) => ReactNode);
  /** 面板内容，支持通过 render prop 获取 close 函数 */
  children: ReactNode | ((props: { close: () => void }) => ReactNode);
  /** 弹出方向，v2.0 直接支持字符串定位 */
  direction?: PopoverDirection;
  /** 面板与触发元素的间距 (px) */
  gap?: number;
  /** 面板的额外偏移量 (px) */
  offset?: number;
  /** 面板与视口的最小间距 (px) */
  padding?: number;
  /** 触发按钮的类名 */
  triggerClassName?: string;
  /** 面板容器的类名 */
  panelClassName?: string;
  /** 是否让面板宽度跟随按钮 */
  sameWidth?: boolean;
  /** 是否禁用 */
  disabled?: boolean;
  portal?: boolean;
}

export const Popover = forwardRef<HTMLDivElement, PopoverProps>(({
  trigger,
  children,
  direction = 'bottom',
  gap = 8,
  offset = 0,
  padding = 8,
  triggerClassName,
  panelClassName,
  sameWidth = false,
  disabled = false,
  portal = true,
}: PopoverProps, ref) => {
  // 构建用于间距控制的 CSS 变量
  const anchorStyles = {
    '--anchor-gap': `${gap}px`,
    '--anchor-offset': `${offset}px`,
    '--anchor-padding': `${padding}px`,
  } as React.CSSProperties;
  return (
    <HeadlessPopover
      className="relative inline-block"
      ref={ref}
    >
      {({ open }) => {
        return (
          <>
            <PopoverButton
              as="div"
              className={cn(
                'inline-flex items-center justify-center outline-none cursor-pointer',
                triggerClassName,
                disabled && 'cursor-not-allowed opacity-50',
              )}
              disabled={disabled}
            >
              {typeof trigger === 'function' ? trigger({ open }) : trigger}
            </PopoverButton>
            <PopoverPanel
              as="div"
              anchor={direction}
              style={anchorStyles}
              portal={portal}
              className={cn(
                'z-20',
                sameWidth && 'w-[--button-width]',
                panelClassName,
              )}
            >
              {({ close }) => (
                <div className="rounded-lg shadow-lg ring-1 ring-black/5">
                  {typeof children === 'function' ? children({ close }) : children}
                </div>
              )}
            </PopoverPanel>
          </>
        );
      }}
    </HeadlessPopover>
  )
});

Popover.displayName = "Popover";

export default Popover;
