import { NodeProps } from "@xyflow/react";
import { NodeSourceHandle } from "../../components/handle/node-source-handle";
import { NodeHeader } from "../../components/nodes-shared";
import type { Node } from "../../types";
import { getNodeTypeIconColor } from "../../utils/node";
import type { HttpRequestNodeData } from "./types";

const HttpRequestNode = ({ id, data }: NodeProps<Node<HttpRequestNodeData>>) => {
  const label = data.label?.trim() || 'HTTP Request';
  const iconColor = data.iconColor || getNodeTypeIconColor(data.type);
  const method = data.method || 'GET';
  const url = data.url?.trim() || '未设置 URL';
  const bodyType = data.bodyType || 'none';
  const retryOnFailure = Boolean(data.retryOnFailure);
  const retryCount = Math.max(1, Number(data.retryCount) || 1);
  const retryIntervalMs = Math.max(0, Number(data.retryIntervalMs) || 0);
  const outputVariableName = data.outputVariableName?.trim() || 'httpResponse';

  return (
    <div className="http-request-node relative">
      <NodeHeader icon={data.icon} iconColor={iconColor} title={label} />
      {!data.candidate && (
        <>
          <div className="space-y-2 p-4">
            <div className="rounded-lg border border-[var(--border)] bg-muted/20 px-3 py-2 text-xs text-muted-foreground">
              <div className="flex flex-wrap gap-2">
                <span className="rounded-full bg-background px-2.5 py-1">{method}</span>
                <span className="rounded-full bg-background px-2.5 py-1">Body: {bodyType}</span>
                <span className="rounded-full bg-background px-2.5 py-1">输出 {outputVariableName}</span>
                <span className="rounded-full bg-background px-2.5 py-1">
                  {retryOnFailure ? `重试 ${retryCount} / ${retryIntervalMs}ms` : '不重试'}
                </span>
              </div>
              <div className="mt-2 truncate">{url}</div>
            </div>
          </div>
          <NodeSourceHandle nodeId={id} handleId="output" />
        </>
      )}
    </div>
  );
};

export default HttpRequestNode;
