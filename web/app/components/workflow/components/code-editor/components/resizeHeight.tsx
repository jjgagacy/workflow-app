import { useResizeHeight } from "../../../hooks/use-resizeHeight";
import { GripHorizontal } from "lucide-react";
import { cn } from "@/utils/classnames";
import { EDITOR_MIN_HEIGHT } from "../data";

type Props = {
  defaultHeight?: number;
  minHeight?: number;
  maxHeight?: number;
  onHeightChange?: (height: number) => void;
  enabled?: boolean;
  showIcon?: boolean;
  iconPosition?: 'top' | 'bottom' | 'both';
  className?: string;
  children?: React.ReactNode;
}

export const EditorResizeHeight = ({
  defaultHeight = 300,
  minHeight = EDITOR_MIN_HEIGHT,
  maxHeight = 600,
  onHeightChange,
  enabled = true,
  showIcon = true,
  iconPosition = 'bottom',
  className,
  children,
}: Props) => {
  const { height, isResizing, handleResizeStart } = useResizeHeight({
    defaultHeight,
    minHeight,
    maxHeight,
    onHeightChange,
    enabled,
  });

  const renderResizeIcon = (position: 'top' | 'bottom') => {
    if (!showIcon) return null;
    if (iconPosition !== position && iconPosition !== 'both') return null;

    return (
      <div
        className={cn(
          'absolute left-0 flex w-full cursor-row-resize items-center justify-center transition-all duration-200',
          position === 'top' ? '-top-2' : '-bottom-2',
          isResizing && 'opacity-100',
          !isResizing && 'opacity-0 group-hover:opacity-100'
        )}
        onMouseDown={handleResizeStart}
        onPointerDown={handleResizeStart}
      >
        <div className="rounded-md bg-gray-100 p-0.5 shadow-sm transition-all hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700">
          <GripHorizontal className="h-4 w-4 text-gray-500 dark:text-gray-400" />
        </div>
      </div>
    );
  };

  return (
    <div className={cn('group relative', className)}>
      {iconPosition === 'top' && renderResizeIcon('top')}
      <div
        className="overflow-y-auto"
        style={{ height: `${height}px` }}
      >
        {children}
      </div>

      {iconPosition === 'bottom' && renderResizeIcon('bottom')}
      {isResizing && (
        <div className="fixed inset-0 z-50 cursor-row-resize bg-transparent" />
      )}
    </div>
  );
}
