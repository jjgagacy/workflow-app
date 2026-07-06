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
} from "./data";
import { WebhookNodeData } from "./type";
import { NodeTextarea } from "../../components/base/node-textarea";

type WebhookPanelProps = {
  node: Node<WebhookNodeData>;
};

type SelectItem = {
  value: string;
  name: string;
};

type WebhookListField = 'headers' | 'params' | 'body';
type UrlTabValue = 'test' | 'production';

const CONTENT_TYPE_OPTIONS: SelectItem[] = [
  { value: 'application/json', name: 'application/json' },
  { value: 'application/x-www-form-urlencoded', name: 'application/x-www-form-urlencoded' },
  { value: 'multipart/form-data', name: 'multipart/form-data' },
  { value: 'text/plain', name: 'text/plain' },
  { value: 'application/octet-stream', name: 'application/octet-stream' },
];

const METHOD_OPTIONS: SelectItem[] = [
  { value: 'GET', name: 'GET' },
  { value: 'POST', name: 'POST' },
  { value: 'PUT', name: 'PUT' },
  { value: 'PATCH', name: 'PATCH' },
  { value: 'DELETE', name: 'DELETE' },
  { value: 'HEAD', name: 'HEAD' },
  { value: 'OPTIONS', name: 'OPTIONS' },
];

type WebhookFieldSectionProps = {
  title: string;
  addLabel: string;
  deleteLabel: string;
  nameLabel: string;
  requiredLabel: string;
  namePlaceholder: string;
  items: ReturnType<typeof normalizeWebhookFieldItems>;
  onAdd: () => void;
  onRemove: (id: string) => void;
  onChange: (id: string, patch: { name?: string; required?: boolean }) => void;
};
const WebhookFieldSection = ({
  title,
  addLabel,
  deleteLabel,
  nameLabel,
  requiredLabel,
  namePlaceholder,
  items,
  onAdd,
  onRemove,
  onChange,
}: WebhookFieldSectionProps) => {
  return (
    // 外层容器：去掉边框，收紧内边距 (py-2)
    <section className="space-y-2 rounded-xl bg-muted/10 px-3 py-2.5">
      {/* 头部区域：保持标题与添加按钮同行 */}
      <div className="flex items-center justify-between">
        <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/80">
          {title}
        </div>
        <button
          type="button"
          onClick={onAdd}
          className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-primary transition-colors hover:bg-primary/5"
        >
          <CirclePlus className="h-3.5 w-3.5" />
          {addLabel}
        </button>
      </div>

      {/* 列表区域 */}
      <div className="space-y-1.5">
        {items.map((item, index) => (
          <div
            key={item.id}
            // 彻底移除单个 item 的 border 和 bg，仅在非首项顶部留出 padding
            className={`pt-2.5 first:pt-0 flex items-end gap-3`}
          >
            {/* 左侧：字段输入核心区域（在一行内紧凑排列） */}
            <div className="flex-1 grid grid-cols-12 gap-2">
              {/* 名称输入框占 8 列 */}
              <label className="col-span-8 block">
                <div className="mb-0.5 text-[10px] font-medium uppercase tracking-wide ">
                  {nameLabel} {items.length > 1 && `#${index + 1}`}
                </div>
                <NodeInput
                  value={item.name}
                  onChange={(event) => onChange(item.id, { name: event.target.value })}
                  placeholder={namePlaceholder}
                  className="h-8 text-sm" // 建议在 NodeInput 内部或通过 className 压低高度
                />
              </label>

              {/* 必填勾选框占 4 列：移除背景和边框，变成纯文字+Checkbox */}
              <label className="col-span-4 flex h-8 items-center gap-1.5 self-end pb-1.5 pl-1 cursor-pointer select-none">
                <Checkbox
                  checked={item.required}
                  onChange={(event) => onChange(item.id, { required: event.target.checked })}
                />
                <span className="text-xs ">{requiredLabel}</span>
              </label>
            </div>

            {/* 右侧：删除按钮（与输入框底边对齐，不再单独占一行） */}
            <div className="pb-1">
              <button
                type="button"
                onClick={() => onRemove(item.id)}
                aria-label={deleteLabel}
                className="rounded-md p-1.5 hover:bg-destructive/10 hover:text-destructive transition-colors"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
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
              onChange={(event) => {
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
              }}
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
