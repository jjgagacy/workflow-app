import { useCallback, useEffect, useRef, useState } from 'react';
import { GripHorizontal } from 'lucide-react';
import cn from '@/utils/classnames';
import { EDITOR_MIN_HEIGHT } from '../components/code-editor/data';

type UseResizeHeightOptions = {
  defaultHeight?: number;
  minHeight?: number;
  maxHeight?: number;
  onHeightChange?: (height: number) => void;
  enabled?: boolean;
};

export const useResizeHeight = ({
  defaultHeight = EDITOR_MIN_HEIGHT,
  minHeight = EDITOR_MIN_HEIGHT,
  maxHeight = 800,
  onHeightChange,
  enabled = true,
}: UseResizeHeightOptions = {}) => {
  const [height, setHeight] = useState(defaultHeight);
  const [isResizing, setIsResizing] = useState(false);
  const resizeStartYRef = useRef(0);
  const resizeStartHeightRef = useRef(height);

  const handleResizeStart = useCallback((event: React.MouseEvent<HTMLDivElement> | React.PointerEvent<HTMLDivElement>) => {
    if (!enabled) return;

    event.preventDefault();
    event.stopPropagation();

    resizeStartYRef.current = event.clientY;
    resizeStartHeightRef.current = height;
    setIsResizing(true);

    document.body.style.userSelect = 'none';
    document.body.style.cursor = 'row-resize';
  }, [enabled, height]);

  const handleResize = useCallback((event: MouseEvent | PointerEvent) => {
    if (!isResizing) return;

    const deltaY = event.clientY - resizeStartYRef.current;
    let newHeight = resizeStartHeightRef.current + deltaY;
    newHeight = Math.max(minHeight, Math.min(maxHeight, newHeight));

    setHeight(newHeight);
    onHeightChange?.(newHeight);
  }, [isResizing, minHeight, maxHeight, onHeightChange]);

  const handleResizeEnd = useCallback(() => {
    if (!isResizing) return;

    setIsResizing(false);
    document.body.style.userSelect = '';
    document.body.style.cursor = '';
  }, [isResizing]);

  // Attach and detach event listeners
  useEffect(() => {
    if (isResizing) {
      window.addEventListener('mousemove', handleResize);
      window.addEventListener('mouseup', handleResizeEnd);
      window.addEventListener('pointermove', handleResize);
      window.addEventListener('pointerup', handleResizeEnd);
    } else {
      window.removeEventListener('mousemove', handleResize);
      window.removeEventListener('mouseup', handleResizeEnd);
      window.removeEventListener('pointermove', handleResize);
      window.removeEventListener('pointerup', handleResizeEnd);
    }

    return () => {
      window.removeEventListener('mousemove', handleResize);
      window.removeEventListener('mouseup', handleResizeEnd);
      window.removeEventListener('pointermove', handleResize);
      window.removeEventListener('pointerup', handleResizeEnd);
    };
  }, [isResizing, handleResize, handleResizeEnd]);

  return {
    height,
    isResizing,
    setHeight,
    handleResizeStart,
    handleResizeEnd,
  };
}