import type { MouseEvent } from 'react'
import { useCallback, useState } from "react";
import { useWorkflowStore } from "../context";

export const RIGHT_MENU_WIDTH = 200;
export const RIGHT_MENU_HEIGHT = 150;

// 提取：计算菜单位置（不超出边界）
export const calculatePositionWithinBounds = (
  clickX: number,
  clickY: number,
  menuWidth: number,
  menuHeight: number,
  containerRect: DOMRect
): { x: number; y: number } => {
  let x = clickX;
  let y = clickY;
  // 如果菜单超出右边界，调整位置
  if (x + menuWidth > containerRect.right) {
    x = containerRect.right - menuWidth;
  }
  // 如果菜单超出下边界，调整位置
  if (y + menuHeight > containerRect.bottom) {
    y = containerRect.bottom - menuHeight;
  }
  // 确保菜单不会超出左边界和上边界
  x = Math.max(x, 0);
  y = Math.max(y, 0);
  return { x, y };
};

// 提取：获取菜单边界矩形
export const getMenuBounds = (
  x: number,
  y: number,
  menuWidth: number,
  menuHeight: number
): { minX: number; minY: number; maxX: number; maxY: number } => {
  return {
    minX: x,
    minY: y,
    maxX: x + menuWidth,
    maxY: y + menuHeight,
  };
};

export const usePanelContextMenu = (containerRef: React.RefObject<HTMLElement | null>) => {
  const contextMenu = useWorkflowStore(s => s.contextMenu);
  const setContextMenu = useWorkflowStore(s => s.setContextMenu);
  const [minX, setMinX] = useState(Number.MIN_VALUE);
  const [minY, setMinY] = useState(Number.MIN_VALUE);
  const [maxX, setMaxX] = useState(Number.MAX_VALUE);
  const [maxY, setMaxY] = useState(Number.MAX_VALUE);

  const updatePositions = useCallback(() => {
    if (!containerRef.current) return;

    const containerRect = containerRef.current.getBoundingClientRect();
    const { x, y } = calculatePositionWithinBounds(
      contextMenu.x,
      contextMenu.y,
      RIGHT_MENU_WIDTH,
      RIGHT_MENU_HEIGHT,
      containerRect
    );
    const bounds = getMenuBounds(x, y, RIGHT_MENU_WIDTH, RIGHT_MENU_HEIGHT);

    setMinX(bounds.minX);
    setMinY(bounds.minY);
    setMaxX(bounds.maxX);
    setMaxY(bounds.maxY);
  }, [containerRef, contextMenu.x, contextMenu.y]);

  const handleContextMenu = useCallback((e: MouseEvent<HTMLElement>) => {
    e.preventDefault();
    const containerRect = containerRef.current?.getBoundingClientRect();
    if (!containerRect) return;

    const { x, y } = calculatePositionWithinBounds(
      e.clientX - containerRect.left,
      e.clientY - containerRect.top,
      RIGHT_MENU_WIDTH,
      RIGHT_MENU_HEIGHT,
      containerRect
    );

    setContextMenu({ x, y, visible: true });
  }, [containerRef, setContextMenu]);

  const handleCancelContextMenu = useCallback(() => {
    setContextMenu({ x: 0, y: 0, visible: false });
  }, [setContextMenu]);

  return {
    minX,
    minY,
    maxX,
    maxY,
    updatePositions,
    handleContextMenu,
    handleCancelContextMenu
  };
};