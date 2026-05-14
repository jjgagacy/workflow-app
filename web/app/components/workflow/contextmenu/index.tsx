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
  const contextMenu = useWorkflowStore(s => s.contextMenu);
  const { handleContextMenu, handleCancelContextMenu } = usePanelContextMenu(containerRef || ref);
  const { handleCancelNodeContextMenu } = useNodeContextMenu(containerRef || ref);
  const { handleCancelSelectionContextMenu } = useSelectionContextMenu(containerRef || ref);

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
        label="Add Node"
        icon={<PlusCircle />}
        shortcut={{ keys: ['N'] }}
        onClick={() => {
          console.log("Add Node");
        }}
      />
      <ContextMenuItem
        label="Add Comment"
        icon={<StickyNote />}
        onClick={() => {
          console.log("Add Comment");
        }}
      />
      <ContextMenuItem
        label="Paste"
        icon={<Square />}
        shortcut={{ keys: ['V'], metaKey: true }}
        onClick={() => {
          console.log("Paste");
        }}
      />
      <ContextMenuItem
        label="Run"
        icon={<Play />}
        shortcut={{ keys: ['R'], ctrlKey: true }}
        onClick={() => {
          console.log("Run");
        }}
      />
      <Divider />

      <ContextMenuItem
        label="Tidy up flow"
        icon={<WandSparkles />}
        onClick={() => {
        }}
      />
      <Divider />
      <ContextMenuItem
        label="Select All"
        icon={<CheckSquare />}
        onClick={() => {
        }}
      />
      <ContextMenuItem
        label="Unselect all"
        icon={<Eraser />}
        onClick={() => {
        }}
      />
    </MenuContainer>
  );
});
