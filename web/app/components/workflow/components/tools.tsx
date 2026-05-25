import dagre from "@dagrejs/dagre";
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

type ToolItem = {
  id: string;
  label: string;
  shortcut: KeyboardShortcut;
  icon: ReactNode;
  onClick: () => void;
  active?: boolean;
};

const getNodeSize = (node: Node) => ({
  width: node.measured?.width || node.width || node.data?.size?.width || 180,
  height: node.measured?.height || node.height || node.data?.size?.height || 64,
});

const getLayoutedNodes = (nodes: Node[], edges: Edge[]) => {
  const graph = new dagre.graphlib.Graph();

  graph.setDefaultEdgeLabel(() => ({}));
  graph.setGraph({
    rankdir: 'TB',
    ranksep: 56,
    nodesep: 40,
    marginx: 24,
    marginy: 24,
  });

  nodes.forEach((node) => {
    const { width, height } = getNodeSize(node);
    graph.setNode(node.id, { width, height });
  });

  edges.forEach((edge) => {
    if (edge.source && edge.target) {
      graph.setEdge(edge.source, edge.target);
    }
  });

  dagre.layout(graph);

  return nodes.map((node) => {
    const position = graph.node(node.id);

    if (!position) {
      return node;
    }

    const { width, height } = getNodeSize(node);

    return {
      ...node,
      position: {
        x: position.x - width / 2,
        y: position.y - height / 2,
      },
    };
  });
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