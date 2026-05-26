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
import { useTranslation } from "react-i18next";
import { useWorkflowInteractions } from "../hooks/use-interactions";

interface SelectionContextMenuProps {
  containerRef?: React.RefObject<HTMLElement | null>;
}

export const SelectionContextMenu = memo(({ containerRef }: SelectionContextMenuProps) => {
  const ref = useRef(null);
  const { t } = useTranslation();
  const selectionMenu = useWorkflowStore(s => s.selectionMenu);
  const { handleSelectionContextMenu, handleCancelSelectionContextMenu } = useSelectionContextMenu(containerRef || ref);
  const { handleCancelContextMenu } = usePanelContextMenu(containerRef || ref);
  const { handleNodeContextMenu, handleCancelNodeContextMenu } = useNodeContextMenu(containerRef || ref);
  const { handleNodesCopy, handleNodesSelectAll, handleNodesUnselectAll } = useWorkflowInteractions();

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
        label={t('workflow.selectionMenu.copy')}
        icon={<Copy />}
        shortcut={{ keys: ['C'], ctrlKey: true }}
        onClick={() => {
          handleNodesCopy();
          handleCancelSelectionContextMenu();
        }}
      />
      <Divider />
      <ContextMenuItem
        label={t('workflow.selectionMenu.tidyUpSelection')}
        icon={<WandSparkles />}
        onClick={() => {
        }}
      />
      <ContextMenuItem
        label={t('workflow.selectionMenu.selectAll')}
        icon={<CheckSquare />}
        onClick={() => {
          handleNodesSelectAll();
          handleCancelSelectionContextMenu();
        }}
      />
      <ContextMenuItem
        label={t('workflow.selectionMenu.clearSelection')}
        icon={<Eraser />}
        onClick={() => {
          handleNodesUnselectAll();
          handleCancelSelectionContextMenu();
        }}
      />
      <Divider />
      <ContextMenuItem
        label={t('workflow.selectionMenu.deactivate')}
        icon={<PowerSquare />}
        shortcut={{ keys: ['D'] }}
        onClick={() => {
        }}
      />
      <ContextMenuItem
        label={t('workflow.selectionMenu.delete')}
        icon={<X />}
        onClick={() => {

        }}
      />
    </MenuContainer>
  );
});
