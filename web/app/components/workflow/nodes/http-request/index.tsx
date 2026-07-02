import { NodeProps } from "@xyflow/react";
import { NodeSourceHandle } from "../../components/handle/node-source-handle";
import { NodeHeader } from "../../components/nodes-shared";
import type { Node } from "../../types";
import { getNodeTypeIconColor } from "../../utils/node";
import type { HttpRequestNodeData } from "./types";
import { DEFAULT_HTTP_RESPONSE_VARIABLE_NAME } from "./data";
import { useTranslation } from "react-i18next";

const HttpRequestNode = ({ id, data }: NodeProps<Node<HttpRequestNodeData>>) => {
  const { t } = useTranslation();
  const label = data.label?.trim() || 'HTTP Request';
  const iconColor = data.iconColor || getNodeTypeIconColor(data.type);
  const method = data.method || 'GET';
  const url = data.url?.trim() || 'NO URL';
  const bodyType = data.bodyType || 'none';
  const retryOnFailure = Boolean(data.retryOnFailure);
  const retryCount = Math.max(1, Number(data.retryCount) || 1);
  const retryIntervalMs = Math.max(0, Number(data.retryIntervalMs) || 0);
  const outputVariableName = data.outputVariableName?.trim() || DEFAULT_HTTP_RESPONSE_VARIABLE_NAME;

  return (
    <div className="http-request-node relative">
      <NodeHeader icon={data.icon} iconColor={iconColor} title={label} />
      {!data.candidate && (
        <>
          <div className="space-y-2 p-4">
            {/* 主信息卡 */}
            <div className="rounded-xl border border-[var(--border)] bg-muted/20 p-3">
              {/* tags */}
              <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                <span className="rounded-full bg-background px-2.5 py-0">
                  {method}
                </span>

                <span className="rounded-full bg-background px-2.5 py-0">
                  Body: {bodyType}
                </span>

                <span className="rounded-full bg-background px-2.5 py-0">
                  {t('workflow.nodes.http-request.output')} {outputVariableName}
                </span>

                <span className="rounded-full bg-background px-2.5 py-0">
                  {retryOnFailure
                    ? `${t('workflow.nodes.http-request.retry')} ${retryCount} / ${retryIntervalMs}ms`
                    : t('workflow.nodes.http-request.noRetry')}
                </span>
              </div>

              {/* URL（弱层级） */}
              <div className="mt-2 text-xs text-muted-foreground/80 truncate">
                {url}
              </div>
            </div>
          </div>

          <NodeSourceHandle nodeId={id} handleId="output" />
        </>
      )}
    </div>
  );
};

export default HttpRequestNode;
