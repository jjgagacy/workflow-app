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
          console.log("Add Node");
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
          console.log("Paste");
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
        onClick={() => {
        }}
      />
      <Divider />
      <ContextMenuItem
        label={t('workflow.contextMenu.selectAll')}
        icon={<CheckSquare />}
        onClick={() => {
        }}
      />
      <ContextMenuItem
        label={t('workflow.contextMenu.unselectAll')}
        icon={<Eraser />}
        onClick={() => {
        }}
      />
    </MenuContainer>
  );
});
