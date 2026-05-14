import { memo, useEffect, useRef } from "react";
import { useWorkflowStore } from "../context";
import { usePanelContextMenu } from "../hooks/use-panelMenu";
import { useClickAway } from "ahooks";
import { SELECTION_MENU_WIDTH, useSelectionContextMenu } from "../hooks/use-selectionMenu";
import { useNodeContextMenu } from "../hooks/use-nodeMenu";
import { MenuContainer } from ".";
import { ContextMenuItem } from "./action/menu-item";
import { CheckSquare, Copy, Eraser, PowerSquare, WandSparkles, X } from "lucide-react";
import { Divider } from "../../base/divider";

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
    <MenuContainer
      style={{
        width: SELECTION_MENU_WIDTH,
        top: selectionMenu.y,
        left: selectionMenu.x,
        display: selectionMenu.visible ? 'block' : 'none',
      }}
      ref={ref}>
      <ContextMenuItem
        label="Copy"
        icon={<Copy />}
        shortcut={{ keys: ['C'], ctrlKey: true }}
        onClick={() => {

        }}
      />
      <Divider />
      <ContextMenuItem
        label="Tidy up selection"
        icon={<WandSparkles />}
        onClick={() => {
        }}
      />
      <ContextMenuItem
        label="Select All"
        icon={<CheckSquare />}
        onClick={() => {
        }}
      />
      <ContextMenuItem
        label="Clear Selection"
        icon={<Eraser />}
        onClick={() => {
        }}
      />
      <Divider />
      <ContextMenuItem
        label="Deactivate"
        icon={<PowerSquare />}
        shortcut={{ keys: ['D'] }}
        onClick={() => {
        }}
      />
      <ContextMenuItem
        label="Delete"
        icon={<X />}
        onClick={() => {

        }}
      />
    </MenuContainer>
  );
});
