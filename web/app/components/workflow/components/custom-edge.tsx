import { BaseEdge, EdgeLabelRenderer, useReactFlow, EdgeProps, Position, getBezierPath } from '@xyflow/react';
import { useMemo } from 'react';
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
    return getEdgeStrokeColor(Boolean(selected));
  }, [selected]);



  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        style={{
          stroke,
          strokeWidth: 1,
        }}
      />
      <EdgeLabelRenderer>
        <div className={cn(
          'nopan nodrag flex items-center gap-1 rounded-full border border-[var(--border)] bg-background/95 p-1 shadow-sm transition-transform',
          data?.hovering ? 'block' : 'hidden',
        )}
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
            pointerEvents: 'all',
          }}
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