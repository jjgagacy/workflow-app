import { cn } from "@/utils/classnames";
import { NodeData } from "../types";
import { NodeResizeControl, useReactFlow, useStoreApi } from "@xyflow/react";
import { NODE_RESIZE_MIN_HEIGHT, NODE_RESIZE_MIN_WIDTH } from "../constants";
import { useWorkflowInteractions } from "../hooks/use-interactions";

export type NodeResizerProps = {
  id: string;
  nodeData: NodeData;
  icon?: React.ReactNode;
};

export const NodeResizer = ({ id, nodeData, icon }: NodeResizerProps) => {
  const { handleNodeResize } = useWorkflowInteractions();
  const store = useStoreApi();
  const { nodes } = store.getState();
  const node = nodes.find(n => n.id === id);
  if (!node)
    return null;

  return (
    <div
      className={cn(
        "pointer-events-auto hidden group-hover:block",
        node.selected && "block",
      )}
    >
      <NodeResizeControl
        position="bottom-right"
        onResize={(_event, params) => handleNodeResize(id, params)}
        minWidth={NODE_RESIZE_MIN_WIDTH}
        minHeight={NODE_RESIZE_MIN_HEIGHT}
      >
        <div
          className='absolute bottom-3 right-3 w-full h-full rounded-sm'
        >
          {icon || (
            <div className="w-3 h-3 bg-gray-500 dark:bg-gray-700 rounded-sm" />
          )}
        </div>
      </NodeResizeControl>
    </div>
  );
}

export default NodeResizer;