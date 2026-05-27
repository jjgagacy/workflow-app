import { NodeProps } from "@xyflow/react";
import { cn } from "@/utils/classnames";
import { FileText } from "lucide-react";
import { NoteNodeData } from "../components/note-node/types";
import { Node, NodeData } from "../types";
import { useMemo } from "react";
import { CUSTOM_NODE_NAME } from "../constants";
import { NodeComponents } from "./types";
import { NodeTargetHandle } from "../components/node-target-handle";

export const BaseNode = (props: NodeProps<Node<NodeData>> & { children?: React.ReactNode }) => {
  const { children, ...nodeProps } = props;
  const { type, data, selected } = nodeProps;
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
        "relative flex min-w-[220px] max-w-[280px] items-stretch gap-3 rounded-md border-1 border-[var(--border)] bg-background text-left shadow-sm transition-all",
        "hover:shadow-xl",
        selected && "ring-1 ring-primary/30 shadow-xl"
      )}
      style={{
        width: data?.size?.width || 240,
        minHeight: data?.size?.height || 88,
      }}
    >
      <div className={cn(
        'group relative pb-1 px-2 py-1',
        'w-full flex-col',
      )}>
        {data.candidate && (
          <>
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border bg-muted/60 text-text-secondary">
              {data.icon || <FileText className="h-4 w-4" />}
            </div>
            <div className="min-w-0 flex-1 space-y-1">
              <div className="truncate text-sm font-semibold leading-5 text-text-primary">
                {label}
              </div>
              {description && (
                <p className="line-clamp-2 text-xs leading-5 text-text-secondary">
                  {description}
                </p>
              )}
            </div>
          </>
        )}
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