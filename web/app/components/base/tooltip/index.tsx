// components/Tooltip.tsx
import { cn } from '@/utils/classnames'
import { ReactNode } from 'react'
import { PopoverArrow } from './popover-arrow'

interface TooltipProps {
  children: ReactNode
  content: ReactNode
  placement?: 'top' | 'bottom' | 'left' | 'right'
  className?: string
}

export function Tooltip({ children, content, placement = 'top', className }: TooltipProps) {
  const placementClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  }[placement]

  return (
    <div className="relative group">
      {children}
      <div
        className={cn(
          'absolute z-10 px-3 py-2 text-sm font-medium text-white bg-gray-900 dark:bg-neutral-800 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap',
          placementClasses,
          className
        )}
      >
        {content}
        <PopoverArrow placement={placement} className="text-gray-900 dark:text-neutral-800" />
      </div>
    </div>
  );
}