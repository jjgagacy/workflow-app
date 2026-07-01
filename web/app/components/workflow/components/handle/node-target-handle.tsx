import { Handle, Position } from "@xyflow/react";
import { cn } from "@/utils/classnames";

type NodeTargetHandleProps = {
  nodeId: string;
  handleId: string;
  type?: 'target';
  position?: Position;
  isConnectable?: boolean;
  className?: string;
  handleClassName?: string;
}

export const NodeTargetHandle = ({
  nodeId,
  handleId,
  type = 'target',
  position = Position.Left,
  isConnectable = true,
  className = '',
  handleClassName = '',
}: NodeTargetHandleProps) => {
  return (
    <>
      <div
        className={cn(
          "absolute z-10 origin-center transition-transform duration-150 will-change-transform hover:scale-110",
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
            "opacity-80",
            "group-hover:opacity-100",
            handleClassName
          )}
        />
      </div>
    </>
  );
}

