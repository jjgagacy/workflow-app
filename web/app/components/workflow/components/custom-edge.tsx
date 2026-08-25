import { BaseEdge, EdgeLabelRenderer, useReactFlow, EdgeProps, Position, getBezierPath } from '@xyflow/react';
import { useMemo, useState, useRef } from 'react';
import { getEdgeStrokeColor } from '../utils/workflow';
import { cn } from '@/utils/classnames';
import { PlusCircle, Trash2 } from 'lucide-react';
import { useWorkflowStore } from '../context';

export function CustomEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  data,
  source,
  target,
  sourceHandleId,
  targetHandleId,
  selected
}: EdgeProps) {
  const { deleteElements } = useReactFlow();
  const setShowNodeSelector = useWorkflowStore((state) => state.setShowNodeSelector);

  // 1. 使用局部 state 替代全局 setEdges，避免全图重绘导致事件丢失
  const [isHovered, setIsHovered] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX: sourceX - 8,
    sourceY,
    sourcePosition: Position.Right,
    targetX: targetX + 8,
    targetY,
    targetPosition: Position.Left,
    curvature: 0.16,
  });

  const stroke = useMemo(() => {
    return getEdgeStrokeColor(Boolean(selected || isHovered || data?._nodeHovering));
  }, [data?._nodeHovering, isHovered, selected]);

  // 进入响应区：取消隐藏倒计时，设为 hover
  const handleMouseEnter = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setIsHovered(true);
  };

  // 离开响应区：加入 80ms 防抖，防止鼠标在 Edge 与悬浮按钮之间快速移动时闪烁/卡住
  const handleMouseLeave = () => {
    timerRef.current = setTimeout(() => {
      setIsHovered(false);
    }, 80);
  };

  return (
    <>
      {/* 实际渲染的可视线条 */}
      <BaseEdge
        id={id}
        path={edgePath}
        style={{
          stroke,
          strokeWidth: 1.5,
        }}
      />

      {/* 2. 核心修正：增加一条透明的粗线条 (20px) 专门用于捕获鼠标 Hover 事件 */}
      <path
        d={edgePath}
        fill="none"
        stroke="transparent"
        strokeWidth={20}
        style={{ cursor: 'pointer' }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      />

      <EdgeLabelRenderer>
        <div
          className={cn(
            'nopan nodrag flex items-center gap-1 rounded-full border border-[var(--border)] bg-background/95 p-1 shadow-sm transition-transform',
            isHovered ? 'block' : 'hidden',
          )}
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
            pointerEvents: 'all',
          }}
          // 当鼠标移动到 Label 按钮面板上时，保持 hover 状态
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <button
            type="button"
            className="flex h-7 w-7 items-center justify-center rounded-full text-[var(--color-text-secondary)] transition-colors hover:bg-[var(--color-muted)] hover:text-[var(--color-primary)]"
            onClick={(event) => {
              event.stopPropagation();
              setShowNodeSelector(true, {
                previousNodeId: source,
                previousNodeSourceHandle: sourceHandleId ?? undefined,
                nextNodeId: target,
                nextNodeTargetHandle: targetHandleId ?? undefined,
              });
            }}
            aria-label="Add node"
          >
            <PlusCircle className="h-4 w-4" />
          </button>
          <button
            type="button"
            className="flex h-7 w-7 items-center justify-center rounded-full text-[var(--color-text-secondary)] transition-colors hover:bg-[var(--color-muted)] hover:text-[var(--color-destructive)]"
            onClick={(event) => {
              event.stopPropagation();
              deleteElements({ edges: [{ id }] });
            }}
            aria-label="Delete edge"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </EdgeLabelRenderer>
    </>
  );
}