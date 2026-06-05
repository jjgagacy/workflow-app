import { cn } from "@/utils/classnames";
import { Handle, Position, useStore } from "@xyflow/react";
import { useWorkflowStore } from "../../context";
import type { Node } from "../../types";

type NodeSourceHandleProps = {
  nodeId: string;
  handleId: string;
  type?: 'source';
  position?: Position;
  isConnectable?: boolean;
  className?: string;
  handleClassName?: string;
}

export const NodeSourceHandle = ({
  nodeId,
  handleId,
  type = 'source',
  position = Position.Right,
  isConnectable = true,
  className = '',
  handleClassName = '',
}: NodeSourceHandleProps) => {
  const setShowNodeSelector = useWorkflowStore(s => s.setShowNodeSelector);
  const currentNode = useStore((s) => s.nodes.find((n) => n.id === nodeId) as Node | undefined);

  const onHandleClick = () => {
    setShowNodeSelector(true, currentNode?.parentId
      ? { parentNodeId: currentNode.parentId, previousNodeId: nodeId }
      : null);
  }

  return (
    <>
      <div
        className={cn(
          "absolute z-10",
          position === Position.Left && "-left-0 top-1/2 -translate-y-1/2",
          position === Position.Right && "-right-0 top-1/2 -translate-y-1/2",
          position === Position.Top && "top-0 left-1/2 -translate-x-1/2 -translate-y-0",
          position === Position.Bottom && "bottom-0 left-1/2 -translate-x-1/2 translate-y-0",
          className
        )}
      >
        <Handle
          id={handleId}
          type={type}
          position={position}
          isConnectable={isConnectable}
          className={cn(
            "!outline-none",
            "node-handle",
            "!h-4 !w-4 rounded-full !bg-background border !border-gray-400 dark:!border-gray-600 transition-opacity",
            "opacity-80 transition-transform origin-center",
            "group-hover:opacity-100 hover:scale-125",
            handleClassName
          )}
          onClick={(e) => {
            e.stopPropagation();
            onHandleClick();
          }}
        />
      </div>
    </>
  );
}