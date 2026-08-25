import React, { useState, useRef, useEffect } from 'react';
import { cn } from "@/utils/classnames";
import { Handle, Position, useStore } from "@xyflow/react";
import { Plus } from "lucide-react";
import { useWorkflowStore } from "../../context";
import type { Node } from "../../types";

type NodeSourceHandleProps = {
  nodeId: string;
  handleId: string;
  type?: 'source' | 'target';
  position?: Position;
  isConnectable?: boolean;
  className?: string;
  handleClassName?: string;
  maxDistance?: number; // Handle 允许跟随移动的最大半径（像素）
}

export const NodeSourceHandle = ({
  nodeId,
  handleId,
  type = 'source',
  position = Position.Right,
  isConnectable = true,
  className = '',
  handleClassName = '',
  maxDistance = 20, // 默认最大磁吸位移 20px，可按需调节
}: NodeSourceHandleProps) => {
  const setShowNodeSelector = useWorkflowStore(s => s.setShowNodeSelector);
  const currentNode = useStore((s) => s.nodes.find((n) => n.id === nodeId) as Node | undefined);
  const isSelected = Boolean(currentNode?.selected);

  const hitAreaRef = useRef<HTMLDivElement>(null);
  const [transform, setTransform] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const [isMouseDown, setIsMouseDown] = useState(false);

  // 1. 鼠标在感应区内移动：计算与中心点的位移
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    // 如果已经按下鼠标（正在拉 Edge），停止跟随，锁定在当前位置
    if (isMouseDown || !hitAreaRef.current) return;

    const rect = hitAreaRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    let dx = e.clientX - centerX;
    let dy = e.clientY - centerY;

    // 限制跟随的最大距离（防止拉得太远偏离节点）
    const distance = Math.sqrt(dx * dx + dy * dy);
    if (distance > maxDistance) {
      const angle = Math.atan2(dy, dx);
      dx = Math.cos(angle) * maxDistance;
      dy = Math.sin(angle) * maxDistance;
    }

    setTransform({ x: dx, y: dy });
  };

  const handleMouseEnter = () => setIsHovered(true);

  // 2. 鼠标离开感应区：未按下时归位
  const handleMouseLeave = () => {
    if (!isMouseDown) {
      setIsHovered(false);
      setTransform({ x: 0, y: 0 });
    }
  };

  // 3. 全局监听 mouseup：连线拖拽结束（松开鼠标）后重置位置
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

  const onHandleClick = () => {
    setShowNodeSelector(true, currentNode?.parentId
      ? { parentNodeId: currentNode.parentId, previousNodeId: nodeId }
      : null);
  };

  return (
    <div
      ref={hitAreaRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={cn(
        // 外层作为感应区 (p-6 -m-6 扩大了周围 24px 的鼠标捕捉范围)
        "absolute z-20 flex items-center justify-center p-6 -m-6 rounded-full cursor-crosshair",
        position === Position.Left && "-left-0 top-1/2 -translate-y-1/2",
        position === Position.Right && "-right-0 top-1/2 -translate-y-1/2",
        position === Position.Top && "top-0 left-1/2 -translate-x-1/2 -translate-y-0",
        position === Position.Bottom && "bottom-0 left-1/2 -translate-x-1/2 translate-y-0",
        className
      )}
    >
      {/* 动态跟随位移包裹层 */}
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
            // 按下鼠标瞬间触发：锁定 Handle 位置，让 React Flow 顺畅拉出连线
            setIsMouseDown(true);
          }}
          onClick={(e) => {
            e.stopPropagation();
            onHandleClick();
          }}
        >
          <Plus className="pointer-events-none h-2.5 w-2.5 stroke-[2.5] text-border" />
        </Handle>
      </div>
    </div>
  );
};