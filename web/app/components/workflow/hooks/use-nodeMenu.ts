import { useCallback } from "react"
import { Node } from "../types"
import { useWorkflowContext, useWorkflowStore } from "../context"
import { calculatePositionWithinBounds } from "./use-panelMenu";

export const NODE_MENU_WIDTH = 150;
export const NODE_MENU_HEIGHT = 100;

export const useNodeContextMenu = (containerRef: React.RefObject<HTMLElement | null>) => {
  const workflowStore = useWorkflowContext();
  const setNodeMenu = useWorkflowStore(s => s.setNodeMenu);

  const handleNodeContextMenu = useCallback((e: MouseEvent, node: Node) => {
    e.preventDefault();
    const containerRect = containerRef.current?.getBoundingClientRect();
    if (!containerRect) return;

    const { x, y } = calculatePositionWithinBounds(
      e.clientX - containerRect.left,
      e.clientY - containerRect.top,
      NODE_MENU_WIDTH,
      NODE_MENU_HEIGHT,
      containerRect
    );

    setNodeMenu({ x, y, visible: true, nodeId: node.id });
  }, [setNodeMenu, calculatePositionWithinBounds, containerRef]);

  const handleCancelNodeContextMenu = useCallback(() => {
    setNodeMenu({ x: 0, y: 0, visible: false, nodeId: undefined });
  }, [setNodeMenu]);

  return {
    handleNodeContextMenu,
    handleCancelNodeContextMenu,
  }
}