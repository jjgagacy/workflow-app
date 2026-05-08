import { useCallback, useEffect, useRef, useState } from "react";

interface SidebarProps {
  children?: React.ReactNode;
  defaultWidth?: number;
  minWidth?: number;
  maxWidth?: number;
  onWidthChange?: (width: number) => void;
}

export const Sidebar = ({
  children,
  defaultWidth = 290,
  minWidth = 200,
  maxWidth = 600,
  onWidthChange,
}: SidebarProps) => {
  const [width, setWidth] = useState(defaultWidth);
  const [isResizing, setIsResizing] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const startXRef = useRef<number>(0);
  const startWidthRef = useRef<number>(0);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
    startXRef.current = e.clientX;
    startWidthRef.current = width;
  }, [width]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isResizing) return;
    const deltaX = startXRef.current - e.clientX;
    let newWidth = startWidthRef.current + deltaX;
    if (newWidth < minWidth) newWidth = minWidth;
    if (newWidth > maxWidth) newWidth = maxWidth;
    setWidth(newWidth);
    onWidthChange?.(newWidth);
  }, [isResizing, minWidth, maxWidth, onWidthChange]);

  const handleMouseUp = useCallback(() => {
    setIsResizing(false);
  }, []);

  useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      // 防止拖拽时选中文本
      document.body.style.userSelect = 'none';
      document.body.style.cursor = 'ew-resize';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.userSelect = '';
      document.body.style.cursor = '';
    };
  }, [isResizing, handleMouseMove, handleMouseUp]);

  return (
    <div ref={sidebarRef} className="flex flex-nowrap border-l border-[var(--border)] overflow-hidden h-full shrink-0 relative" style={{ width: `${width}px` }}>
      <div className={`
          absolute left-0 top-0 bottom-0 w-1 cursor-ew-resize
          hover:bg-gray-400 hover:w-1.5 active:bg-gray-500
          transition-all duration-150 z-10
          ${isResizing ? 'bg-gray-500 w-1.5' : 'bg-transparent'}
        `}
        onMouseDown={handleMouseDown}
      ></div>
      {isResizing && (
        <div className="fixed inset-0 z-50 cursor-ew-resize" style={{ background: 'transparent' }} />
      )}
      <div className="flex flex-col h-full w-full overflow-auto">
        {children}
      </div>
    </div>
  );
}