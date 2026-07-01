import { NodeProps } from "@xyflow/react";
import { cn } from "@/utils/classnames";
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
        "relative flex min-w-[200px] items-stretch gap-3 text-left transition-all",
        isIterationNode ? "max-w-none" : "max-w-[260px]",
        isIterationNode && "pointer-events-none",
        !isDisabled && "hover:shadow-xl",
        isDisabled && "bg-gray-100 text-gray-400 opacity-80 dark:bg-gray-800/80 dark:text-gray-500",
        selected && "ring-primary/30 shadow-xl",
        data.candidate && "bg-background rounded-lg"
      )}
      style={{
        width: data?.size?.width || NODE_DEFAULT_WIDTH,
        minHeight: data?.size?.height || NODE_DEFAULT_HEIGHT,
      }}
    >
      <div className={cn(
        'group relative',
        'w-full flex-col',
        isIterationNode && 'pointer-events-none',
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