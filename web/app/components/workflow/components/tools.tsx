import { type ReactNode, useCallback } from "react";
import { useReactFlow } from "@xyflow/react";
import { Hand, MousePointer2, PlusCircle, StickyNote, WandSparkles } from "lucide-react";
import { cn } from "@/utils/classnames";
import { ShortcutTooltip, type KeyboardShortcut } from "../../base/tooltip/shortcut";
import { useWorkflowStore } from "../context";
import { useAddNote } from "../hooks/use-addNote";
import { useKeyboardShortcut } from "../hooks/use-keyboardShortcut";
import type { Edge, Node } from "../types";
import { useTranslation } from "react-i18next";
import { getLayoutedNodes } from "../utils/layout";

type ToolItem = {
  id: string;
  label: string;
  shortcut: KeyboardShortcut;
  icon: ReactNode;
  onClick: () => void;
  active?: boolean;
};

export const Tools = () => {
  const { t } = useTranslation();
  const { getNodes, getEdges, setNodes, fitView } = useReactFlow<Node, Edge>();
  const setShowNodeSelector = useWorkflowStore(s => s.setShowNodeSelector);
  const interactionMode = useWorkflowStore(s => s.interactionMode);
  const setInteractionMode = useWorkflowStore(s => s.setInteractionMode);
  const { addNote } = useAddNote();

  const handleAddNode = useCallback(() => {
    setShowNodeSelector(true);
  }, [setShowNodeSelector]);

  const handleAddNote = useCallback(() => {
    addNote();
  }, [addNote]);

  const handleTidyNodes = useCallback(() => {
    const nodes = getNodes();

    if (!nodes.length) {
      return;
    }

    setNodes(getLayoutedNodes(nodes, getEdges()));
    requestAnimationFrame(() => {
      void fitView({ padding: 0.18, duration: 240 });
    });
  }, [fitView, getEdges, getNodes, setNodes]);

  useKeyboardShortcut('n', handleAddNode);
  useKeyboardShortcut('n', handleAddNote, { shiftKey: true });
  useKeyboardShortcut('v', () => setInteractionMode('pointer'));
  useKeyboardShortcut('h', () => setInteractionMode('hand'));
  useKeyboardShortcut('o', handleTidyNodes);

  const tools: ToolItem[] = [
    {
      id: 'add-node',
      label: t('workflow.control.addNode'),
      shortcut: { keys: ['N'] },
      icon: <PlusCircle className="h-4 w-4" />,
      onClick: handleAddNode,
    },
    {
      id: 'add-note-node',
      label: t('workflow.control.addNote'),
      shortcut: { keys: ['N'], shiftKey: true },
      icon: <StickyNote className="h-4 w-4" />,
      onClick: handleAddNote,
    },
    {
      id: 'pointer-mode',
      label: t('workflow.control.pointerMode'),
      shortcut: { keys: ['V'] },
      icon: <MousePointer2 className="h-4 w-4" />,
      onClick: () => setInteractionMode('pointer'),
      active: interactionMode === 'pointer',
    },
    {
      id: 'hand-mode',
      label: t('workflow.control.handMode'),
      shortcut: { keys: ['H'] },
      icon: <Hand className="h-4 w-4" />,
      onClick: () => setInteractionMode('hand'),
      active: interactionMode === 'hand',
    },
    {
      id: 'tidy-nodes',
      label: t('workflow.control.tidyNodes'),
      shortcut: { keys: ['O'] },
      icon: <WandSparkles className="h-4 w-4" />,
      onClick: handleTidyNodes,
    },
  ];

  return (
    <div className="flex flex-row items-center gap-1 rounded-md border-[0.5px] border-[var(--border)] bg-background p-1 shadow-md">
      {tools.map((tool) => (
        <ShortcutTooltip
          key={tool.id}
          label={tool.label}
          shortcut={tool.shortcut}
          placement="bottom"
        >
          <button
            type="button"
            aria-label={tool.label}
            onClick={tool.onClick}
            className={cn(
              'flex h-8 w-8 items-center justify-center rounded-md border border-transparent text-foreground transition-colors',
              'hover:border-[var(--border)] hover:bg-muted/70',
              tool.active && 'border-[var(--border)] bg-muted text-foreground shadow-sm',
            )}
          >
            {tool.icon}
          </button>
        </ShortcutTooltip>
      ))}
    </div>
  );
};