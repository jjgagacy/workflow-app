import { NodeProps } from "@xyflow/react";
import { IfElseNodeData } from "./types";
import { Node } from "../../types";
import { NodeSourceHandle } from "../../components/handle/node-source-handle";
import { getNodeTypeIconColor } from "../../utils/node";
import { useOperators } from "../../hooks/use-operators";

const IfElseNode = ({ id, data }: NodeProps<Node<IfElseNodeData>>) => {
  const label = data.label?.trim() || "If-Else";
  const iconColor = data.iconColor || getNodeTypeIconColor(data.type);
  const { getOperators } = useOperators();

  console.log('branches:', data.branches);

  return (
    <div className="if-else-node">
      <div className="node-header mb-2 flex items-center gap-1 px-1 py-1.5">
        {data.icon && (
          <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md ${iconColor} [&>svg]:h-5 [&>svg]:w-5`}>
            {data.icon}
          </span>
        )}
        <span className="truncate text-sm font-medium tracking-[0.01em] text-[var(--color-text-primary)]">
          {label}
        </span>
      </div>
      {!data.candidate && (
        <>
          <div className="node-content">
            {/* Render node content based on data */}
          </div>
          <div className="relative flex h-6 items-center px-1">
            <div className="w-full text-xs text-right text-text-secondary">ELSE</div>
            <NodeSourceHandle
              nodeId={id}
              handleId="true"
              className="top-1/2 !-right-[8px] left-full ml-1"
            />
          </div>
        </>
      )}
    </div>
  );
}

export default IfElseNode;