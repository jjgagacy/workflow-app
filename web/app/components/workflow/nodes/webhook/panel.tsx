import { BASE_URL } from "@/config";
import { Checkbox } from "@/app/ui/checkbox";
import { SimpleSelect } from "@/app/ui/select";
import { toast } from "@/app/ui/toast";
import { Tabs } from "@/app/components/base/tabs";
import { CirclePlus, Copy, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import DeleteButton from "../../components/base/delete-button";
import { NodeInput } from "../../components/base/node-input";
import { useWorkflowStore } from "../../context";
import { useNodesUpdate } from "../../hooks/use-nodesUpdate";
import { HttpMethod, Node } from "../../types";
import {
  buildWebhookUrls,
  fetchWebhookPath,
  normalizeWebhookFieldItems,
  normalizeWebhookPath,
  createWebhookFieldItem,
  UrlTabValue,
  WebhookListField,
  CONTENT_TYPE_OPTIONS,
  METHOD_OPTIONS,
} from "./data";
import { WebhookNodeData } from "./type";
import { NodeTextarea } from "../../components/base/node-textarea";
import { WebhookFieldSection } from "./section";

type WebhookPanelProps = {
  node: Node<WebhookNodeData>;
};

export type SelectItem = {
  value: string;
  name: string;
};

const WebhookNodePanel = ({ node }: WebhookPanelProps) => {
  const { t } = useTranslation();
  const updateActivePanelNode = useWorkflowStore((state) => state.updateActivePanelNode);
  const { onNodeDataUpdate } = useNodesUpdate();
  const [isPathLoading, setIsPathLoading] = useState(false);
  const [urlTab, setUrlTab] = useState<UrlTabValue>('test');

  const path = node.data.path ?? '';
  const method = (node.data.httpMethod ?? 'POST') as HttpMethod;
  const contentType = node.data.contentType ?? 'application/json';
  const statusCodeInput = node.data.statusCode === undefined ? '' : String(node.data.statusCode);
  const responseBody = node.data.responseBody ?? 'ok';

  const headers = useMemo(() => normalizeWebhookFieldItems(node.data.headers), [node.data.headers]);
  const params = useMemo(() => normalizeWebhookFieldItems(node.data.params), [node.data.params]);
  const body = useMemo(() => normalizeWebhookFieldItems(node.data.body), [node.data.body]);

  const computedUrls = useMemo(() => buildWebhookUrls(BASE_URL, path), [path]);
  const webhookUrl = node.data.webhookUrl || computedUrls.webhookUrl;
  const webhookTestUrl = node.data.webhookTestUrl || computedUrls.webhookTestUrl;

  const activeWebhookUrl = urlTab === 'test' ? webhookTestUrl : webhookUrl;

  const urlTabOptions = useMemo<Array<{ value: UrlTabValue; label: string }>>(() => ([
    {
      value: 'test',
      label: t('workflow.nodes.webhook.webhookTestUrl'),
    },
    {
      value: 'production',
      label: t('workflow.nodes.webhook.webhookUrl'),
    },
  ]), [t]);

  const syncNodeData = (patch: Partial<WebhookNodeData>) => {
    const nextNode = {
      ...node,
      data: {
        ...node.data,
        ...patch,
      },
    };

    updateActivePanelNode(nextNode);
    onNodeDataUpdate({
      id: node.id,
      data: patch,
    });
  };

  const syncPath = (nextPath: string) => {
    const normalizedPath = normalizeWebhookPath(nextPath);
    const nextUrls = buildWebhookUrls(BASE_URL, normalizedPath);
    syncNodeData({
      path: normalizedPath,
      webhookUrl: nextUrls.webhookUrl,
      webhookTestUrl: nextUrls.webhookTestUrl,
    });
  };

  const updateFieldItems = (field: WebhookListField, nextItems: ReturnType<typeof normalizeWebhookFieldItems>) => {
    syncNodeData({ [field]: nextItems } as Partial<WebhookNodeData>);
  };

  const addFieldItem = (field: WebhookListField) => {
    const currentItems = normalizeWebhookFieldItems(node.data[field]);
    updateFieldItems(field, [...currentItems, createWebhookFieldItem()]);
  };

  const removeFieldItem = (field: WebhookListField, itemId: string) => {
    const currentItems = normalizeWebhookFieldItems(node.data[field]);
    const nextItems = currentItems.filter((item) => item.id !== itemId);
    updateFieldItems(field, nextItems.length ? nextItems : [createWebhookFieldItem()]);
  };

  const upsertFieldItem = (field: WebhookListField, itemId: string, patch: { name?: string; required?: boolean }) => {
    const currentItems = normalizeWebhookFieldItems(node.data[field]);
    const nextItems = currentItems.map((item) => {
      if (item.id !== itemId) {
        return item;
      }

      return {
        ...item,
        ...patch,
      };
    });

    updateFieldItems(field, nextItems);
  };

  useEffect(() => {
    let canceled = false;

    const hydratePath = async () => {
      if (path.trim()) {
        return;
      }

      setIsPathLoading(true);
      try {
        const fetchedPath = await fetchWebhookPath({
          nodeId: node.id,
          userId: node.data.userId,
        });

        if (canceled) {
          return;
        }

        const normalized = normalizeWebhookPath(fetchedPath);
        if (normalized) {
          syncPath(normalized);
        }
      } finally {
        if (!canceled) {
          setIsPathLoading(false);
        }
      }
    };

    void hydratePath();

    return () => {
      canceled = true;
    };
  }, [node.id]);

  const handleStatusCodeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const raw = event.target.value.trim();
    if (!raw) {
      syncNodeData({ statusCode: undefined });
      return;
    }

    const numeric = Number(raw);
    if (Number.isNaN(numeric)) {
      return;
    }

    syncNodeData({ statusCode: Math.max(100, Math.min(599, Math.floor(numeric))) });
  };

  return (
    <div className="space-y-4">
      <section className="space-y-3 rounded-xl bg-muted/15 px-4 py-4">
        <div className="text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">{t('workflow.nodes.webhook.requestConfig')}</div>

        <div className="grid gap-3 md:grid-cols-2">
          <div className="block">
            <div className="mb-1 text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">{t('workflow.nodes.webhook.method')}</div>
            <SimpleSelect
              items={METHOD_OPTIONS}
              defaultValue={method}
              allowSearch={false}
              className="w-full"
              onSelect={(item) => syncNodeData({ httpMethod: item.value as HttpMethod })}
            />
          </div>

          <div className="block">
            <div className="mb-1 text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">{t('workflow.nodes.webhook.contentType')}</div>
            <SimpleSelect
              items={CONTENT_TYPE_OPTIONS}
              defaultValue={contentType}
              allowSearch={false}
              className="w-full"
              onSelect={(item) => syncNodeData({ contentType: String(item.value) })}
            />
          </div>
        </div>

        <label className="block">
          <div className="mb-1 text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">{t('workflow.nodes.webhook.path')}</div>
          <NodeInput
            value={path}
            disabled
            placeholder={isPathLoading ? t('workflow.nodes.webhook.pathLoading') : t('workflow.nodes.webhook.pathPlaceholder')}
          />
          <div className="mt-1 text-xs text-muted-foreground/70">{t('workflow.nodes.webhook.pathReadonly')}</div>
        </label>
      </section>

      <section className="space-y-3 rounded-xl bg-muted/15 px-4 py-4">
        <div className="text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">{t('workflow.nodes.webhook.urlConfig')}</div>

        <Tabs
          value={urlTab}
          options={urlTabOptions}
          size="small"
          variant="default"
          onChange={(value) => setUrlTab(value)}
        />

        <div className="flex items-center gap-2">
          <div className="min-w-0 flex-1">
            <NodeInput value={activeWebhookUrl} disabled />
          </div>
          <button
            type="button"
            aria-label="copy webhook url"
            className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-[var(--border)] bg-background text-muted-foreground transition-colors hover:bg-muted/70 hover:text-foreground"
            onClick={() => {
              // TODO: Add clipboard write logic when copy behavior is finalized.
              toast.success('已复制');
            }}
          >
            <Copy className="h-4 w-4" />
          </button>
        </div>
      </section>

      <WebhookFieldSection
        title={t('workflow.nodes.webhook.queryStrings')}
        addLabel={t('workflow.nodes.webhook.addQueryString')}
        deleteLabel={t('workflow.nodes.webhook.deleteQueryString')}
        nameLabel={t('workflow.nodes.webhook.fieldName')}
        requiredLabel={t('workflow.nodes.webhook.required')}
        namePlaceholder={t('workflow.nodes.webhook.queryStringPlaceholder')}
        items={params}
        onAdd={() => addFieldItem('params')}
        onRemove={(id) => removeFieldItem('params', id)}
        onChange={(id, patch) => upsertFieldItem('params', id, patch)}
      />

      <WebhookFieldSection
        title={t('workflow.nodes.webhook.headerParams')}
        addLabel={t('workflow.nodes.webhook.addHeaderParam')}
        deleteLabel={t('workflow.nodes.webhook.deleteHeaderParam')}
        nameLabel={t('workflow.nodes.webhook.fieldName')}
        requiredLabel={t('workflow.nodes.webhook.required')}
        namePlaceholder={t('workflow.nodes.webhook.headerParamPlaceholder')}
        items={headers}
        onAdd={() => addFieldItem('headers')}
        onRemove={(id) => removeFieldItem('headers', id)}
        onChange={(id, patch) => upsertFieldItem('headers', id, patch)}
      />

      <WebhookFieldSection
        title={t('workflow.nodes.webhook.bodyParams')}
        addLabel={t('workflow.nodes.webhook.addBodyParam')}
        deleteLabel={t('workflow.nodes.webhook.deleteBodyParam')}
        nameLabel={t('workflow.nodes.webhook.fieldName')}
        requiredLabel={t('workflow.nodes.webhook.required')}
        namePlaceholder={t('workflow.nodes.webhook.bodyParamPlaceholder')}
        items={body}
        onAdd={() => addFieldItem('body')}
        onRemove={(id) => removeFieldItem('body', id)}
        onChange={(id, patch) => upsertFieldItem('body', id, patch)}
      />

      <section className="space-y-3 rounded-xl bg-muted/15 px-4 py-4">
        <div className="text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">{t('workflow.nodes.webhook.successResponse')}</div>
        <div className="grid gap-3 md:grid-cols-1">
          <label className="block">
            <div className="mb-1 text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">{t('workflow.nodes.webhook.statusCode')}</div>
            <NodeInput
              value={statusCodeInput}
              onChange={handleStatusCodeChange}
              placeholder="200"
              inputMode="numeric"
            />
          </label>

          <label className="block">
            <div className="mb-1 text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">{t('workflow.nodes.webhook.message')}</div>
            <NodeTextarea
              value={responseBody}
              onChange={(event) => syncNodeData({ responseBody: event.target.value })}
              placeholder={t('workflow.nodes.webhook.messagePlaceholder')}
            />
          </label>
        </div>
      </section>
    </div>
  );
}

export default WebhookNodePanel;
