import { NodeProps } from "@xyflow/react";
import { cn } from "@/utils/classnames";
import { FileText } from "lucide-react";
import { NoteNodeData } from "../components/note-node/types";
import { Node, NodeData, NodeType } from "../types";
import { useMemo } from "react";
import { CUSTOM_NODE_NAME, NODE_DEFAULT_HEIGHT, NODE_DEFAULT_WIDTH } from "../constants";
import { NodeComponents } from "./types";
import { NodeTargetHandle } from "../components/handle/node-target-handle";

export const BaseNode = (props: NodeProps<Node<NodeData>> & { children?: React.ReactNode }) => {
  const { children, ...nodeProps } = props;
  const { type, data, selected } = nodeProps;
  const isDisabled = Boolean(data.disabled);
  const isIterationNode = data.type === NodeType.Iteration;
  const label = data.label?.trim() || "Untitled node";
  const description = data.description?.trim();
  const NodeComponent = useMemo(() => {
    if (type === CUSTOM_NODE_NAME) {
      return NodeComponents[data.type];
    }

    return () => null;
  }, [type, data.type]);

  return (
    <div
      className={cn(
        "relative flex min-w-[200px] items-stretch gap-3 rounded-md border-1 border-[var(--border)] bg-background text-left shadow-sm transition-all",
        isIterationNode ? "max-w-none" : "max-w-[260px]",
        !isDisabled && "hover:shadow-xl",
        isDisabled && "border-gray-300 bg-gray-100 text-gray-400 opacity-80 dark:border-gray-700 dark:bg-gray-800/80 dark:text-gray-500",
        selected && "ring-1 ring-primary/30 shadow-xl"
      )}
      style={{
        width: data?.size?.width || NODE_DEFAULT_WIDTH,
        minHeight: data?.size?.height || NODE_DEFAULT_HEIGHT,
      }}
    >
      <div className={cn(
        'group relative',
        'w-full flex-col',
      )}>
        {
          !data.candidate && (
            <NodeTargetHandle
              nodeId={nodeProps.id}
              handleId="target"
            />
          )
        }
        {NodeComponent && <NodeComponent {...nodeProps} />}
        {children}
      </div>
    </div>
  );
}