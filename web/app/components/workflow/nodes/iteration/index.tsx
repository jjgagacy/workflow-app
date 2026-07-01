import { NodeProps, useReactFlow, useStore, useStoreApi } from "@xyflow/react";
import { Grip, PlusCircle } from "lucide-react";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { produce } from "immer";
import { useWorkflowStore } from "../../context";
import { Node } from "../../types";
import { useIterationRequiredSize } from "../../hooks/use-iteration-required-size";
import { getNodeTypeIconColor } from "../../utils/node";
import { NodeHeader } from "../../components/nodes-shared";
import { NodeSourceHandle } from "../../components/handle/node-source-handle";
import type { IterationNodeData } from "./types";
import { NodeResizer } from "../../components/node-resizer";
import { NODE_DEFAULT_HEIGHT, NODE_DEFAULT_WIDTH, NODE_RESIZE_MIN_HEIGHT, NODE_RESIZE_MIN_WIDTH } from "../../constants";

const IterationNode = ({ id, data }: NodeProps<Node<IterationNodeData>>) => {
  const { t } = useTranslation();
  const storeApi = useStoreApi();
  const { setNodes } = useReactFlow();
  const setShowNodeSelector = useWorkflowStore((state) => state.setShowNodeSelector);
  const childNodes = useStore((state) => state.nodes.filter((node) => node.parentId === id) as Node[]);
  const childNodeCount = childNodes.length;
  const iconColor = data.iconColor || getNodeTypeIconColor(data.type);
  const label = data.label?.trim() || t('workflow.nodes.iteration.name');
  const hasChildren = childNodeCount > 0;
  const size = data.size;

  const requiredSize = useIterationRequiredSize({ childNodes, size });

  useEffect(() => {
    const currentWidth = size?.width || NODE_DEFAULT_WIDTH;
    const currentHeight = size?.height || NODE_DEFAULT_HEIGHT;
    if (requiredSize.width <= currentWidth && requiredSize.height <= currentHeight) {
      return;
    }

    const { nodes } = storeApi.getState();
    const nextNodes = produce(nodes as Node[], (draft) => {
      const currentNode = draft.find((node) => node.id === id);
      if (!currentNode) {
        return;
      }
      currentNode.data = {
        ...currentNode.data,
        size: {
          width: Math.max(currentWidth, requiredSize.width),
          height: Math.max(currentHeight, requiredSize.height),
        },
      };
    });
    setNodes(nextNodes);
  }, [id, requiredSize.height, requiredSize.width, setNodes, size?.height, size?.width, storeApi]);

  return (
    <div
      className="pointer-events-none relative h-full min-h-[90px] min-w-[200px] overflow-visible rounded-md"
      style={{
        width: size?.width || NODE_DEFAULT_WIDTH,
        minHeight: size?.height || NODE_DEFAULT_HEIGHT,
      }}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-70"
        style={{
          backgroundImage: 'linear-gradient(to right, rgba(148, 163, 184, 0.12) 1px, transparent 1px), linear-gradient(to bottom, rgba(148, 163, 184, 0.12) 1px, transparent 1px)',
          backgroundSize: '16px 16px',
        }}
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-slate-100/60 via-transparent to-sky-100/50 dark:from-slate-900/60 dark:to-slate-800/50" />
      <NodeResizer
        id={id}
        icon={<Grip className="h-3 w-3 text-gray-400 dark:text-gray-600" />}
      />
      <div className="pointer-events-none relative flex min-h-[90px] flex-col">
        <div className="pointer-events-auto flex items-start justify-between gap-3 px-1 py-1.5">
          <NodeHeader icon={data.icon} iconColor={iconColor} title={label} />
          <button
            type="button"
            className="mr-2 mt-1 flex h-8 w-8 items-center justify-center rounded-md border border-[var(--border)] bg-background/90 text-muted-foreground transition-colors hover:bg-muted/70 hover:text-foreground"
            onClick={(event) => {
              event.stopPropagation();
              setShowNodeSelector(true, { parentNodeId: id });
            }}
            aria-label={t('workflow.control.addNode')}
          >
            <PlusCircle className="h-4 w-4" />
          </button>
        </div>

        {!hasChildren && (
          <div className="pointer-events-auto relative flex flex-1 items-center justify-center px-4 pb-4 pt-2">
            <div className="flex min-h-[120px] w-full flex-col items-center justify-center rounded-xl border border-dashed border-[var(--border)] bg-background/70 px-4 py-5 text-center">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-muted/60 text-muted-foreground [&>svg]:h-5 [&>svg]:w-5">
                {data.icon}
              </div>
              <div className="text-sm font-medium text-foreground">
                {t('workflow.nodes.iteration.description')}
              </div>
              <button
                type="button"
                className="mt-4 inline-flex items-center gap-2 rounded-md border border-[var(--border)] bg-background px-3 py-2 text-sm text-foreground transition-colors hover:bg-muted/70"
                onClick={(event) => {
                  event.stopPropagation();
                  setShowNodeSelector(true, { parentNodeId: id });
                }}
              >
                <PlusCircle className="h-4 w-4" />
                {t('workflow.control.addNode')}
              </button>
            </div>
          </div>
        )}
      </div>
      {!data.candidate && <NodeSourceHandle nodeId={id} handleId="output" className="pointer-events-auto" />}
    </div>
  );
};

export default IterationNode;