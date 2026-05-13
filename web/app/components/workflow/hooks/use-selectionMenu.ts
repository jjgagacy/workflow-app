import { useCallback } from "react";
import { useWorkflowContext, useWorkflowStore } from "../context";
import { calculatePositionWithinBounds } from "./use-panelMenu";
import { Node } from "../types";

export const SELECTION_MENU_WIDTH = 150;
export const SELECTION_MENU_HEIGHT = 100;

export const useSelectionContextMenu = (containerRef: React.RefObject<HTMLElement | null>) => {
  const workflowStore = useWorkflowContext();
  const setSelectionMenu = useWorkflowStore(s => s.setSelectionMenu);

  const handleSelectionContextMenu = useCallback((e: MouseEvent, nodes: Node[]) => {
    e.preventDefault();
    const containerRect = containerRef.current?.getBoundingClientRect();
    if (!containerRect) return;

    const { x, y } = calculatePositionWithinBounds(
      e.clientX - containerRect.left,
      e.clientY - containerRect.top,
      SELECTION_MENU_WIDTH,
      SELECTION_MENU_HEIGHT,
      containerRect
    );

    setSelectionMenu({ x, y, visible: true });
  }, [setSelectionMenu, calculatePositionWithinBounds, containerRef]);

  const handleCancelSelectionContextMenu = useCallback(() => {
    setSelectionMenu({ x: 0, y: 0, visible: false });
  }, [setSelectionMenu]);

  return {
    handleSelectionContextMenu,
    handleCancelSelectionContextMenu,
  }
}