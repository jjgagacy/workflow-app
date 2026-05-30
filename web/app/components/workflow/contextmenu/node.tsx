import { memo, useEffect, useRef } from "react";
import { useStoreApi } from "@xyflow/react";
import { NODE_MENU_WIDTH, useNodeContextMenu } from "../hooks/use-nodeMenu";
import { useWorkflowStore } from "../context";
import { useClickAway } from "ahooks";
import { usePanelContextMenu } from "../hooks/use-panelMenu";
import { useSelectionContextMenu } from "../hooks/use-selectionMenu";
import { MenuContainer } from ".";
import { ContextMenuItem } from "./action/menu-item";
import { Copy, FolderOpen, PowerSquare, Replace, X } from "lucide-react";
import { Divider } from "../../base/divider";
import { useTranslation } from "react-i18next";
import { useWorkflowInteractions } from "../hooks/use-interactions";
import { Node } from "../types";

interface NodeContextMenuProps {
  containerRef?: React.RefObject<HTMLElement | null>;
}

export const NodeContextMenu = memo(({ containerRef }: NodeContextMenuProps) => {
  const ref = useRef(null);
  const store = useStoreApi();
  const { t } = useTranslation();
  const nodeMenu = useWorkflowStore(s => s.nodeMenu);
  const openNodePanel = useWorkflowStore(s => s.openNodePanel);
  const { handleNodeContextMenu, handleCancelNodeContextMenu } = useNodeContextMenu(containerRef || ref);
  const { handleCancelContextMenu } = usePanelContextMenu(containerRef || ref);
  const { handleCancelSelectionContextMenu } = useSelectionContextMenu(containerRef || ref);
  const { handleNodesCopy } = useWorkflowInteractions();

  useEffect(() => {
    if (nodeMenu.visible) {
      handleCancelContextMenu(); // 当显示节点菜单时，隐藏面板菜单
      handleCancelSelectionContextMenu(); // 当显示节点菜单时，隐藏选择菜单
    }
  }, [nodeMenu]);

  useClickAway(() => {
    handleCancelNodeContextMenu();
  }, ref);

  if (nodeMenu.visible === false) {
    return null;
  }

  return (
    <MenuContainer
      style={{
        width: NODE_MENU_WIDTH,
        top: nodeMenu.y,
        left: nodeMenu.x,
        display: nodeMenu.visible ? 'block' : 'none',
      }}
      ref={ref}>
      <ContextMenuItem
        label={t('workflow.nodeMenu.open')}
        icon={<FolderOpen />}
        shortcut={{ keys: ['enter'] }}
        onClick={() => {
          const nodes = store.getState().nodes as Node[];
          const node = nodes.find((item) => item.id === nodeMenu.nodeId);
          if (node) {
            openNodePanel(node);
          }
          handleCancelNodeContextMenu();
        }}
      />
      <ContextMenuItem
        label={t('workflow.nodeMenu.replace')}
        icon={<Replace />}
        shortcut={{ keys: ['R'] }}
        onClick={() => {

        }}
      />
      <ContextMenuItem
        label={t('workflow.nodeMenu.copy')}
        icon={<Copy />}
        shortcut={{ keys: ['C'], ctrlKey: true }}
        onClick={() => {
          if (nodeMenu.nodeId) {
            handleNodesCopy(nodeMenu.nodeId);
          }
          handleCancelNodeContextMenu();
        }}
      />
      <Divider />
      <ContextMenuItem
        label={t('workflow.nodeMenu.deactivate')}
        icon={<PowerSquare />}
        shortcut={{ keys: ['D'] }}
        onClick={() => {

        }}
      />
      <ContextMenuItem
        label={t('workflow.nodeMenu.delete')}
        icon={<X />}
        onClick={() => {

        }}
      />
    </MenuContainer>
  );
});
