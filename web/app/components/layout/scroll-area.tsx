'use client';

import { cn } from '@/utils/classnames';
import * as React from 'react';

interface ScrollAreaProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  orientation?: 'vertical' | 'horizontal' | 'both';
}

export const ScrollArea = React.forwardRef<HTMLDivElement, ScrollAreaProps>(
  ({ className, children, orientation = 'both', ...props }, ref) => {
    return (
      <div
        ref={ref}
        data-slot='scroll-area'
        className={cn(
          'relative',
          className
        )}
        {...props}
      >
        <div
          className={cn(
            'h-full w-full rounded-[inherit]',
            (orientation !== 'horizontal' && 'overflow-y-auto'),
            (orientation !== 'vertical' && 'overflow-x-auto')
          )}
        >
          {children}
        </div>
        <ScrollBar orientation={orientation} />
        {/* 角落填充，防止滚动条重叠时出现空白 */}
        <div className='absolute bottom-0 right-0 z-10 h-4 w-4 bg-background' />
      </div>
    );
  });

ScrollArea.displayName = 'ScrollArea';

interface ScrollBarProps extends React.HTMLAttributes<HTMLDivElement> {
  orientation?: 'vertical' | 'horizontal' | 'both';
  forceMount?: boolean;
}

const ScrollBar = React.forwardRef<HTMLDivElement, ScrollBarProps>(
  ({ className, orientation = 'both', forceMount, ...props }, ref) => {
    const [isVisible, setIsVisible] = React.useState(false);

    React.useEffect(() => {
      // 这里可以添加滚动条显示/隐藏的逻辑
      setIsVisible(true);
    }, []);

    if (!forceMount && !isVisible) {
      return null;
    }

    return (
      <>
        {(orientation === 'both' || orientation === 'vertical') && (
          <div
            ref={ref}
            className={cn(
              'flex touch-none select-none transition-colors',
              'absolute top-0 right-0 z-50 w-2.5 p-px',
              'hover:bg-border/50',
              className
            )}
            {...props}
          >
            <div className='relative flex-1 rounded-full bg-border/20'>
              <div className='absolute left-0 top-0 w-full rounded-full bg-border/60 transition-colors hover:bg-border/80' />
            </div>
          </div>
        )}
        {(orientation === 'both' || orientation === 'horizontal') && (
          <div
            ref={ref}
            className={cn(
              'flex touch-none select-none transition-colors',
              'absolute bottom-0 left-0 z-50 h-2.5 p-px',
              'hover:bg-border/50',
              className
            )}
            {...props}
          >
            <div className='relative flex-w rounded-full bg-border/20'>
              <div className='absolute left-0 top-0 h-full rounded-full bg-border/60 transition-colors hover:bg-border/80' />
            </div>
          </div>
        )}
      </>
    );
  }
);

ScrollBar.displayName = 'ScrollBar';

