import { memo, useEffect, useRef } from "react";
import { useWorkflowStore } from "../context";
import { usePanelContextMenu } from "../hooks/use-panelMenu";
import { useClickAway } from "ahooks";
import { SELECTION_MENU_WIDTH, useSelectionContextMenu } from "../hooks/use-selectionMenu";
import { useNodeContextMenu } from "../hooks/use-nodeMenu";

interface SelectionContextMenuProps {
  containerRef?: React.RefObject<HTMLElement | null>;
}

export const SelectionContextMenu = memo(({ containerRef }: SelectionContextMenuProps) => {
  const ref = useRef(null);
  const selectionMenu = useWorkflowStore(s => s.selectionMenu);
  const { handleSelectionContextMenu, handleCancelSelectionContextMenu } = useSelectionContextMenu(containerRef || ref);
  const { handleCancelContextMenu } = usePanelContextMenu(containerRef || ref);
  const { handleNodeContextMenu, handleCancelNodeContextMenu } = useNodeContextMenu(containerRef || ref);

  useEffect(() => {
    if (selectionMenu.visible) {
      handleCancelContextMenu(); // 当显示选择菜单时，隐藏面板菜单
      handleCancelNodeContextMenu(); // 当显示选择菜单时，隐藏节点菜单
    }
  }, [selectionMenu]);

  useClickAway(() => {
    handleCancelSelectionContextMenu();
  }, ref);

  if (selectionMenu.visible === false) {
    return null;
  }

  return (
    <div
      className={`absolute z-20 w-[${SELECTION_MENU_WIDTH}px] rounded-md border-[0.5px] bg-background shadow-md`}
      style={{
        top: selectionMenu.y,
        left: selectionMenu.x,
        display: selectionMenu.visible ? 'block' : 'none',
      }}
      ref={ref}>

      789

    </div>
  );
});
