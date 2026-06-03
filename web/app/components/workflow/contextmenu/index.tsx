import { useReactFlow } from "@xyflow/react";
import { memo, useEffect, useRef } from "react";
import { useWorkflowStore } from "../context";
import { RIGHT_MENU_WIDTH, usePanelContextMenu } from "../hooks/use-panelMenu";
import { useClickAway } from "ahooks";
import { useNodeContextMenu } from "../hooks/use-nodeMenu";
import { useSelectionContextMenu } from "../hooks/use-selectionMenu";
import { ContextMenuItem } from "./action/menu-item";
import { CheckSquare, Eraser, Play, PlusCircle, Square, StickyNote, WandSparkles } from "lucide-react";
import { Divider } from "../../base/divider";
import { cn } from "@/utils/classnames";
import { useAddNote } from "../hooks/use-addNote";
import { useTranslation } from "react-i18next";
import { useWorkflowInteractions } from "../hooks/use-interactions";
import type { Edge, Node } from "../types";
import { getLayoutedNodes } from "../utils/layout";
import { useWorkflowHistory, WorkflowHistoryEvent } from "../hooks/use-workflow-history";

interface ContextMenuProps {
  containerRef?: React.RefObject<HTMLElement | null>;
}

interface MenuContainerProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  ref: React.RefObject<HTMLDivElement | null>;
}

export const MenuContainer = ({ children, className, style, ref }: MenuContainerProps) => {
  return (
    <div
      className={cn(`absolute z-20 rounded-md border-[0.5px] border-[var(--border)] bg-background shadow-md`, className)}
      style={style}
      ref={ref}
    >
      {children}
    </div>
  );
}

export const ContextMenu = memo(({ containerRef }: ContextMenuProps) => {
  const ref = useRef(null);
  const { t } = useTranslation();
  const contextMenu = useWorkflowStore(s => s.contextMenu);
  const { handleContextMenu, handleCancelContextMenu } = usePanelContextMenu(containerRef || ref);
  const { handleCancelNodeContextMenu } = useNodeContextMenu(containerRef || ref);
  const { handleCancelSelectionContextMenu } = useSelectionContextMenu(containerRef || ref);
  const { addNote } = useAddNote();
  const { handleNodesPaste, handleNodesSelectAll, handleNodesUnselectAll } = useWorkflowInteractions();
  const { getNodes, getEdges, setNodes, fitView } = useReactFlow<Node, Edge>();
  const setShowNodeSelector = useWorkflowStore(s => s.setShowNodeSelector);
  const { addHistoryState } = useWorkflowHistory();

  const handleTidyNodes = () => {
    const nodes = getNodes();

    if (!nodes.length) {
      return;
    }

    const nextEdges = getEdges();
    const nextNodes = getLayoutedNodes(nodes, nextEdges);

    setNodes(nextNodes);
    addHistoryState(WorkflowHistoryEvent.LayoutTidy, { nodes: nextNodes, edges: nextEdges });
    handleCancelContextMenu();
    requestAnimationFrame(() => {
      void fitView({ padding: 0.18, duration: 240 });
    });
  };

  useEffect(() => {
    if (contextMenu.visible) {
      handleCancelNodeContextMenu(); // 当显示面板菜单时，隐藏节点菜单
      handleCancelSelectionContextMenu(); // 当显示面板菜单时，隐藏选择菜单
    }
  }, [contextMenu]);

  useClickAway(() => {
    // 点击其他地方时隐藏菜单
    handleCancelContextMenu();
  }, ref);

  if (contextMenu.visible === false) {
    return null;
  }

  return (
    <MenuContainer
      style={{
        width: RIGHT_MENU_WIDTH,
        top: contextMenu.y,
        left: contextMenu.x,
        display: contextMenu.visible ? 'block' : 'none',
      }}
      ref={ref}>
      <ContextMenuItem
        label={t('workflow.contextMenu.addNode')}
        icon={<PlusCircle />}
        shortcut={{ keys: ['N'] }}
        onClick={() => {
          setShowNodeSelector(true);
          handleCancelContextMenu();
        }}
      />
      <ContextMenuItem
        label={t('workflow.contextMenu.addNote')}
        icon={<StickyNote />}
        onClick={() => {
          addNote();
          handleCancelContextMenu();
        }}
      />
      <ContextMenuItem
        label={t('workflow.contextMenu.paste')}
        icon={<Square />}
        shortcut={{ keys: ['V'], metaKey: true }}
        onClick={() => {
          handleNodesPaste();
          handleCancelContextMenu();
        }}
      />
      <ContextMenuItem
        label={t('workflow.contextMenu.run')}
        icon={<Play />}
        shortcut={{ keys: ['R'], ctrlKey: true }}
        onClick={() => {
          console.log("Run");
        }}
      />
      <Divider />

      <ContextMenuItem
        label={t('workflow.contextMenu.tidyUpFlow')}
        icon={<WandSparkles />}
        onClick={handleTidyNodes}
      />
      <Divider />
      <ContextMenuItem
        label={t('workflow.contextMenu.selectAll')}
        icon={<CheckSquare />}
        onClick={() => {
          handleNodesSelectAll();
          handleCancelContextMenu();
        }}
      />
      <ContextMenuItem
        label={t('workflow.contextMenu.unselectAll')}
        icon={<Eraser />}
        onClick={() => {
          handleNodesUnselectAll();
          handleCancelContextMenu();
        }}
      />
    </MenuContainer>
  );
});
