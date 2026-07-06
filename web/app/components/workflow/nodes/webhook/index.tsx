import { NodeProps } from "@xyflow/react";
import type { Node } from "../../types";
import { NodeSourceHandle } from "../../components/handle/node-source-handle";
import { NodeHeader } from "../../components/nodes-shared";
import { useTranslation } from "react-i18next";
import { getNodeTypeIconColor } from "../../utils/node";
import { WebhookNodeData } from "./type";
import { buildWebhookUrls } from "./data";
import { BASE_URL } from "@/config";

const WebhookNode = ({ id, data }: NodeProps<Node<WebhookNodeData>>) => {
  const { t } = useTranslation();
  const label = data.label?.trim() || t('workflow.nodes.webhook.name');
  const iconColor = data.iconColor || getNodeTypeIconColor(data.type);
  const method = data.httpMethod || 'POST';
  const contentType = data.contentType || 'application/json';
  const path = data.path?.trim() || t('workflow.nodes.webhook.pathLoading');
  const urls = buildWebhookUrls(BASE_URL, data.path);
  const webhookUrl = data.webhookUrl || urls.webhookUrl;
  const webhookTestUrl = data.webhookTestUrl || urls.webhookTestUrl;
  const queryCount = data.params?.length || 0;
  const headerCount = data.headers?.length || 0;
  const bodyCount = data.body?.length || 0;
  const statusCode = data.statusCode ?? 200;
  const message = data.responseBody || 'ok';

  return (
    <div className="webhook-node relative">
      <NodeHeader icon={data.icon} iconColor={iconColor} title={label} />
      {!data.candidate && (
        <>
          <div className="space-y-2 p-4">
            <div className="rounded-xl border border-[var(--border)] bg-muted/20 p-3">
              <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                <span className="rounded-full bg-background px-2.5 py-0">{method}</span>
                <span className="rounded-full bg-background px-2.5 py-0">{contentType}</span>
                <span className="rounded-full bg-background px-2.5 py-0">{statusCode}</span>
              </div>
              <div className="mt-2 truncate text-xs text-muted-foreground/80">/{path}</div>
            </div>
          </div>

          <NodeSourceHandle nodeId={id} handleId="output" />
        </>
      )}
    </div>
  );
}

export default WebhookNode;