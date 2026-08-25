import React, { useState, useRef, useEffect } from 'react';
import { Handle, Position, useStore } from "@xyflow/react";
import { Plus } from "lucide-react";
import { cn } from "@/utils/classnames";
import type { Node } from "../../types";

type NodeTargetHandleProps = {
  nodeId: string;
  handleId: string;
  type?: 'target';
  position?: Position;
  isConnectable?: boolean;
  className?: string;
  handleClassName?: string;
  maxDistance?: number;
}

export const NodeTargetHandle = ({
  nodeId,
  handleId,
  type = 'target',
  position = Position.Left,
  isConnectable = true,
  className = '',
  handleClassName = '',
  maxDistance = 20,
}: NodeTargetHandleProps) => {
  const currentNode = useStore((s) => s.nodes.find((n) => n.id === nodeId) as Node | undefined);
  const isSelected = Boolean(currentNode?.selected);

  const hitAreaRef = useRef<HTMLDivElement>(null);
  const [transform, setTransform] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const [isMouseDown, setIsMouseDown] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isMouseDown || !hitAreaRef.current) return;

    const rect = hitAreaRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    let dx = e.clientX - centerX;
    let dy = e.clientY - centerY;

    const distance = Math.sqrt(dx * dx + dy * dy);
    if (distance > maxDistance) {
      const angle = Math.atan2(dy, dx);
      dx = Math.cos(angle) * maxDistance;
      dy = Math.sin(angle) * maxDistance;
    }

    setTransform({ x: dx, y: dy });
  };

  const handleMouseEnter = () => setIsHovered(true);

  const handleMouseLeave = () => {
    if (!isMouseDown) {
      setIsHovered(false);
      setTransform({ x: 0, y: 0 });
    }
  };

  useEffect(() => {
    const handleGlobalMouseUp = () => {
      if (isMouseDown) {
        setIsMouseDown(false);
        setTransform({ x: 0, y: 0 });
        setIsHovered(false);
      }
    };

    window.addEventListener('mouseup', handleGlobalMouseUp);
    return () => window.removeEventListener('mouseup', handleGlobalMouseUp);
  }, [isMouseDown]);

  return (
    <div
      ref={hitAreaRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={cn(
        "absolute z-20 flex items-center justify-center p-6 -m-6 rounded-full cursor-crosshair",
        position === Position.Left && "-left-0 top-1/2 -translate-y-1/2",
        position === Position.Right && "-right-0 top-1/2 -translate-y-1/2",
        position === Position.Top && "top-0 left-1/2 -translate-x-1/2 -translate-y-0",
        position === Position.Bottom && "bottom-0 left-1/2 -translate-x-1/2 translate-y-0",
        className
      )}
    >
      <div
        style={{
          transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
          transition: isMouseDown ? 'none' : 'transform 0.08s ease-out',
        }}
        className="will-change-transform flex items-center justify-center"
      >
        <Handle
          id={handleId}
          type={type}
          position={position}
          isConnectable={isConnectable}
          className={cn(
            "!outline-none",
            "node-handle",
            "!h-4 !w-4 !p-0 rounded-full !bg-background border !border-border transition-opacity duration-150",
            "!flex !items-center !justify-center",
            isSelected || isHovered || isMouseDown ? "opacity-100 scale-110" : "opacity-0 group-hover:opacity-100",
            handleClassName
          )}
          onMouseDown={() => {
            setIsMouseDown(true);
          }}
        >
          <Plus className="pointer-events-none h-2.5 w-2.5 stroke-[2.5] text-border" />
        </Handle>
      </div>
    </div>
  );
}

