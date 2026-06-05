import { Fragment, type ReactNode, useCallback } from "react";
import { useReactFlow } from "@xyflow/react";
import { Hand, MessageSquare, MousePointer2, PlusCircle, Settings2, StickyNote, WandSparkles } from "lucide-react";
import { cn } from "@/utils/classnames";
import { Divider } from "../../base/divider";
import { ShortcutTooltip, type KeyboardShortcut } from "../../base/tooltip/shortcut";
import { useWorkflowStore } from "../context";
import { useAddNote } from "../hooks/use-addNote";
import { useKeyboardShortcut } from "../hooks/use-keyboardShortcut";
import type { Edge, Node } from "../types";
import { useTranslation } from "react-i18next";
import { getLayoutedNodes } from "../utils/layout";
import { useWorkflowHistory, WorkflowHistoryEvent } from "../hooks/use-workflow-history";

const toolIconClassName = 'h-4 w-4';

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
  const openEnvPanel = useWorkflowStore(s => s.openEnvPanel);
  const openChatEnvPanel = useWorkflowStore(s => s.openChatEnvPanel);
  const { addNote } = useAddNote();
  const { addHistoryState } = useWorkflowHistory();

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

    const nextEdges = getEdges();
    const nextNodes = getLayoutedNodes(nodes, nextEdges);

    setNodes(nextNodes);
    addHistoryState(WorkflowHistoryEvent.LayoutTidy, { nodes: nextNodes, edges: nextEdges });
    requestAnimationFrame(() => {
      void fitView({ padding: 0.18, duration: 240 });
    });
  }, [addHistoryState, fitView, getEdges, getNodes, setNodes]);

  const handleOpenEnvPanel = useCallback(() => {
    openEnvPanel();
  }, [openEnvPanel]);

  const handleOpenChatEnvPanel = useCallback(() => {
    openChatEnvPanel();
  }, [openChatEnvPanel]);

  useKeyboardShortcut('n', handleAddNode);
  useKeyboardShortcut('n', handleAddNote, { shiftKey: true });
  useKeyboardShortcut('v', () => setInteractionMode('pointer'));
  useKeyboardShortcut('h', () => setInteractionMode('hand'));
  useKeyboardShortcut('o', handleTidyNodes);
  useKeyboardShortcut('e', handleOpenEnvPanel);
  useKeyboardShortcut('e', handleOpenChatEnvPanel, { shiftKey: true });

  const tools: ToolItem[] = [
    {
      id: 'add-node',
      label: t('workflow.control.addNode'),
      shortcut: { keys: ['N'] },
      icon: <PlusCircle className={toolIconClassName} />,
      onClick: handleAddNode,
    },
    {
      id: 'add-note-node',
      label: t('workflow.control.addNote'),
      shortcut: { keys: ['N'], shiftKey: true },
      icon: <StickyNote className={toolIconClassName} />,
      onClick: handleAddNote,
    },
    {
      id: 'pointer-mode',
      label: t('workflow.control.pointerMode'),
      shortcut: { keys: ['V'] },
      icon: <MousePointer2 className={toolIconClassName} />,
      onClick: () => setInteractionMode('pointer'),
      active: interactionMode === 'pointer',
    },
    {
      id: 'hand-mode',
      label: t('workflow.control.handMode'),
      shortcut: { keys: ['H'] },
      icon: <Hand className={toolIconClassName} />,
      onClick: () => setInteractionMode('hand'),
      active: interactionMode === 'hand',
    },
    {
      id: 'tidy-nodes',
      label: t('workflow.control.tidyNodes'),
      shortcut: { keys: ['O'] },
      icon: <WandSparkles className={toolIconClassName} />,
      onClick: handleTidyNodes,
    },
    {
      id: 'env-panel',
      label: 'Env',
      shortcut: { keys: ['E'] },
      icon: <Settings2 className={toolIconClassName} />,
      onClick: handleOpenEnvPanel,
    },
    {
      id: 'chat-env-panel',
      label: 'Session',
      shortcut: { keys: ['E'], shiftKey: true },
      icon: <MessageSquare className={toolIconClassName} />,
      onClick: handleOpenChatEnvPanel,
    },
  ];

  const toolGroups: ToolItem[][] = [
    tools.slice(0, 2),
    tools.slice(2, 5),
    tools.slice(5, 7),
  ];

  return (
    <div className="flex flex-row items-center gap-1 rounded-md border-[0.5px] border-[var(--border)] bg-background p-1 shadow-md">
      {toolGroups.map((group, groupIndex) => (
        <Fragment key={`group-${groupIndex}`}>
          <div className="flex items-center gap-1">
            {group.map((tool) => (
              <ShortcutTooltip
                key={tool.id}
                label={tool.label}
                shortcut={tool.shortcut}
                placement="bottom"
              >
                <button
                  type="button"
                  aria-label={tool.label}
                  onClick={(event) => {
                    event.stopPropagation();
                    tool.onClick();
                  }}
                  className={cn(
                    'flex h-6 w-6 items-center justify-center rounded-md border border-transparent text-muted-foreground/60 transition-colors',
                    'hover:border-[var(--border)] hover:bg-muted/70 hover:text-foreground',
                    tool.active && 'border-[var(--border)] bg-muted text-foreground shadow-sm',
                  )}
                >
                  {tool.icon}
                </button>
              </ShortcutTooltip>
            ))}
          </div>
          {groupIndex < toolGroups.length - 1 ? <Divider type="vertical" className="mx-1 h-5" /> : null}
        </Fragment>
      ))}
    </div>
  );
};