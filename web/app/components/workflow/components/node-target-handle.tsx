import { Handle, Position } from "@xyflow/react";
import { NodeProps } from "@xyflow/react";
import { Node, NodeData, NodeCatalog } from "../types";
import { CUSTOM_NODE_NAME, CUSTOM_SIMPLE_NODE_NAME } from "../constants";
import { NodeType } from "../types";
import { cn } from "@/utils/classnames";

type NodeTargetHandleProps = {
  nodeId: string;
  handleId: string;
  type?: 'target';
  position?: Position;
  isConnectable?: boolean;
}

export const NodeTargetHandle = ({ nodeId, handleId, type = 'target', position = Position.Left, isConnectable = true }: NodeTargetHandleProps) => {
  return (
    <>
      <div
        className={cn(
          "absolute z-10",
          position === Position.Left && "-left-0 top-1/2 -translate-y-1/2",
          position === Position.Right && "-right-0 top-1/2 -translate-y-1/2",
          position === Position.Top && "top-0 left-1/2 -translate-x-1/2 -translate-y-0",
          position === Position.Bottom && "bottom-0 left-1/2 -translate-x-1/2 translate-y-0",
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
          )}
        />
      </div>
    </>
  );
}

