import { NodeProps } from "@xyflow/react";
import { NodeSourceHandle } from "../../components/handle/node-source-handle";
import { NodeHeader } from "../../components/nodes-shared";
import type { Node } from "../../types";
import { getNodeTypeIconColor } from "../../utils/node";
import type { VariableAggregatorNodeData } from "./types";

const VariableAggregatorNode = ({ id, data }: NodeProps<Node<VariableAggregatorNodeData>>) => {
  const label = data.label?.trim() || 'Variable Aggregator';
  const iconColor = data.iconColor || getNodeTypeIconColor(data.type);
  const variableCount = data.variables?.length ?? 0;
  const outputName = data.outputName?.trim() || 'aggregated';

  return (
    <div className="variable-aggregator-node relative">
      <NodeHeader icon={data.icon} iconColor={iconColor} title={label} />
      {!data.candidate && (
        <>
          <div className="space-y-2 p-4">
            <div className="rounded-lg border border-[var(--border)] bg-muted/20 px-3 py-2 text-xs text-muted-foreground">
              <div className="flex flex-wrap gap-2">
                <span className="rounded-full bg-background px-2.5 py-1">
                  聚合变量 {variableCount}
                </span>
                <span className="rounded-full bg-background px-2.5 py-1">
                  输出 {outputName}
                </span>
              </div>
            </div>
          </div>
          <NodeSourceHandle nodeId={id} handleId="output" />
        </>
      )}
    </div>
  );
};

export default VariableAggregatorNode;
