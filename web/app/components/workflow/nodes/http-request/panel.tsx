import { useMemo } from "react";
import { CirclePlus, Trash2 } from "lucide-react";
import { useStoreApi } from "@xyflow/react";
import { useTranslation } from "react-i18next";
import { Checkbox } from "@/app/ui/checkbox";
import { SimpleSelect } from "@/app/ui/select";
import { Textarea } from "@/app/ui/textarea";
import { buildVariableSelectItems, buildWorkflowVariableOptions } from "../../components/nodes-shared/variable-select";
import { useWorkflowStore } from "../../context";
import { useNodesUpdate } from "../../hooks/use-nodesUpdate";
import type { Node } from "../../types";
import { createHttpKeyValueItem } from "./data";
import type {
  HttpBodyType,
  HttpExceptionStrategy,
  HttpKeyValueItem,
  HttpMethod,
  HttpRequestNodeData,
} from "./types";

type HttpRequestPanelProps = {
  node: Node<HttpRequestNodeData>;
};

type SelectItem = {
  value: string;
  name: string;
  description?: string;
  group?: string;
};

type KeyValueField = 'headers' | 'params' | 'bodyFormData' | 'bodyUrlEncoded';

const inputClassName = 'w-full rounded-md border border-[var(--border)] bg-background px-3 py-2 text-sm text-foreground outline-none transition-colors focus:border-primary/60';

const METHOD_ITEMS: SelectItem[] = [
  { value: 'GET', name: 'GET' },
  { value: 'POST', name: 'POST' },
  { value: 'PUT', name: 'PUT' },
  { value: 'PATCH', name: 'PATCH' },
  { value: 'DELETE', name: 'DELETE' },
  { value: 'HEAD', name: 'HEAD' },
  { value: 'OPTIONS', name: 'OPTIONS' },
];

const BODY_TYPE_ITEMS: SelectItem[] = [
  { value: 'none', name: 'none' },
  { value: 'form-data', name: 'form-data' },
  { value: 'x-www-form-urlencoded', name: 'x-www-form-urlencoded' },
  { value: 'json', name: 'json' },
  { value: 'raw', name: 'raw' },
  { value: 'binary', name: 'binary' },
];

const EXCEPTION_STRATEGY_ITEMS: SelectItem[] = [
  {
    value: 'stop-execution',
    name: '停止执行',
    description: '请求异常时立即停止当前执行。',
  },
  {
    value: 'return-default',
    name: '返回默认值',
    description: '请求异常时返回默认值。',
  },
];

const KeyValueEditor = ({
  title,
  addLabel,
  items,
  onAdd,
  onRemove,
  onChange,
}: {
  title: string;
  addLabel: string;
  items: HttpKeyValueItem[];
  onAdd: () => void;
  onRemove: (id: string) => void;
  onChange: (id: string, patch: Partial<HttpKeyValueItem>) => void;
}) => {
  return (
    <section className="space-y-3 rounded-xl bg-muted/15 px-4 py-4">
      <div className="flex items-center justify-between gap-2">
        <div className="text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">{title}</div>
        <button
          type="button"
          onClick={onAdd}
          className="inline-flex items-center gap-1.5 rounded-md border border-[var(--border)] bg-background px-2.5 py-1.5 text-xs text-foreground transition-colors hover:bg-muted/70"
        >
          <CirclePlus className="h-3.5 w-3.5" />
          {addLabel}
        </button>
      </div>

      <div className="space-y-2">
        {items.map((item, index) => (
          <div key={item.id} className="rounded-lg border border-[var(--border)] bg-background px-3 py-3">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div className="text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">{title} {index + 1}</div>
              <button
                type="button"
                onClick={() => onRemove(item.id)}
                className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground"
                aria-label={`删除${title}`}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <label className="block">
                <div className="mb-1 text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">Key</div>
                <input
                  value={item.key}
                  onChange={(event) => onChange(item.id, { key: event.target.value })}
                  placeholder="例如: Authorization"
                  className={inputClassName}
                />
              </label>
              <label className="block">
                <div className="mb-1 text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">Value</div>
                <input
                  value={item.value}
                  onChange={(event) => onChange(item.id, { value: event.target.value })}
                  placeholder="例如: Bearer xxx"
                  className={inputClassName}
                />
              </label>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

const HttpRequestPanel = ({ node }: HttpRequestPanelProps) => {
  const { t } = useTranslation();
  const store = useStoreApi();
  const updateActivePanelNode = useWorkflowStore((state) => state.updateActivePanelNode);
  const chatEnvVariables = useWorkflowStore((state) => state.chatEnvVariables);
  const envVariables = useWorkflowStore((state) => state.envVariables);
  const { onNodeDataUpdate } = useNodesUpdate();

  const url = node.data.url ?? '';
  const method = (node.data.method ?? 'GET') as HttpMethod;
  const headers = node.data.headers ?? [createHttpKeyValueItem()];
  const params = node.data.params ?? [createHttpKeyValueItem()];
  const bodyType = (node.data.bodyType ?? 'none') as HttpBodyType;
  const bodyFormData = node.data.bodyFormData ?? [createHttpKeyValueItem()];
  const bodyUrlEncoded = node.data.bodyUrlEncoded ?? [createHttpKeyValueItem()];
  const bodyJson = node.data.bodyJson ?? '';
  const bodyRaw = node.data.bodyRaw ?? '';
  const bodyBinaryVariable = node.data.bodyBinaryVariable ?? '';
  const timeoutConnectMs = Math.max(0, Number(node.data.timeoutConnectMs) || 0);
  const timeoutReadMs = Math.max(0, Number(node.data.timeoutReadMs) || 0);
  const timeoutWriteMs = Math.max(0, Number(node.data.timeoutWriteMs) || 0);
  const retryOnFailure = Boolean(node.data.retryOnFailure);
  const retryCount = Math.max(1, Number(node.data.retryCount) || 1);
  const retryIntervalMs = Math.max(0, Number(node.data.retryIntervalMs) || 0);
  const exceptionStrategy = (node.data.exceptionStrategy ?? 'stop-execution') as HttpExceptionStrategy;
  const exceptionDefaultValue = node.data.exceptionDefaultValue ?? '';
  const outputVariableName = node.data.outputVariableName ?? 'httpResponse';

  const syncNodeData = (patch: Partial<HttpRequestNodeData>) => {
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

  const updateKeyValueItems = (field: KeyValueField, nextItems: HttpKeyValueItem[]) => {
    syncNodeData({ [field]: nextItems } as Partial<HttpRequestNodeData>);
  };

  const upsertKeyValue = (field: KeyValueField, itemId: string, patch: Partial<HttpKeyValueItem>) => {
    const currentItems = (node.data[field] as HttpKeyValueItem[] | undefined) ?? [createHttpKeyValueItem()];
    const nextItems = currentItems.map((item) => {
      if (item.id !== itemId) {
        return item;
      }

      return {
        ...item,
        ...patch,
      };
    });

    updateKeyValueItems(field, nextItems);
  };

  const addKeyValue = (field: KeyValueField) => {
    const currentItems = (node.data[field] as HttpKeyValueItem[] | undefined) ?? [createHttpKeyValueItem()];
    updateKeyValueItems(field, [...currentItems, createHttpKeyValueItem()]);
  };

  const removeKeyValue = (field: KeyValueField, itemId: string) => {
    const currentItems = (node.data[field] as HttpKeyValueItem[] | undefined) ?? [createHttpKeyValueItem()];
    const nextItems = currentItems.filter((item) => item.id !== itemId);
    updateKeyValueItems(field, nextItems.length ? nextItems : [createHttpKeyValueItem()]);
  };

  const variableItems = useMemo(() => {
    const nodes = store.getState().nodes as Node[];
    const variableOptions = buildWorkflowVariableOptions({
      t,
      nodeId: node.id,
      nodes,
      envVariables,
      chatEnvVariables,
    });

    return buildVariableSelectItems({
      t,
      currentValue: bodyBinaryVariable,
      options: variableOptions,
    });
  }, [bodyBinaryVariable, chatEnvVariables, envVariables, node.id, store, t]);

  const showBodyValueInput = bodyType !== 'none' && bodyType !== 'binary';

  return (
    <div className="space-y-4">
      <div className="rounded-lg bg-muted/20 px-4 py-3">
        <div className="text-sm font-semibold text-foreground">{node.data.label?.trim() || 'HTTP Request'}</div>
        <div className="mt-1 text-xs leading-5 text-muted-foreground">
          配置请求地址、请求体与超时策略，发起 HTTP 调用并输出结果。
        </div>
        <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
          <span className="rounded-full bg-background px-2.5 py-1">{method}</span>
          <span className="rounded-full bg-background px-2.5 py-1">Body: {bodyType}</span>
          <span className="rounded-full bg-background px-2.5 py-1">输出 {outputVariableName}</span>
        </div>
      </div>

      <section className="space-y-3 rounded-xl bg-muted/15 px-4 py-4">
        <div className="text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">请求配置</div>
        <div className="grid gap-3 md:grid-cols-3">
          <label className="block md:col-span-2">
            <div className="mb-1 text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">URL</div>
            <input
              value={url}
              onChange={(event) => syncNodeData({ url: event.target.value })}
              placeholder="https://api.example.com/v1/resource"
              className={inputClassName}
            />
          </label>
          <div className="block">
            <div className="mb-1 text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">方法</div>
            <SimpleSelect
              items={METHOD_ITEMS}
              defaultValue={method}
              allowSearch={false}
              className="w-full"
              onSelect={(item) => syncNodeData({ method: item.value as HttpMethod })}
            />
          </div>
        </div>
      </section>

      <KeyValueEditor
        title="Headers"
        addLabel="添加 Header"
        items={headers}
        onAdd={() => addKeyValue('headers')}
        onRemove={(id) => removeKeyValue('headers', id)}
        onChange={(id, patch) => upsertKeyValue('headers', id, patch)}
      />

      <KeyValueEditor
        title="Params"
        addLabel="添加 Param"
        items={params}
        onAdd={() => addKeyValue('params')}
        onRemove={(id) => removeKeyValue('params', id)}
        onChange={(id, patch) => upsertKeyValue('params', id, patch)}
      />

      <section className="space-y-3 rounded-xl bg-muted/15 px-4 py-4">
        <div className="text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">请求 Body</div>
        <div className="max-w-[320px]">
          <SimpleSelect
            items={BODY_TYPE_ITEMS}
            defaultValue={bodyType}
            allowSearch={false}
            className="w-full"
            onSelect={(item) => syncNodeData({ bodyType: item.value as HttpBodyType })}
          />
        </div>

        {bodyType === 'form-data' && (
          <KeyValueEditor
            title="Form Data"
            addLabel="添加字段"
            items={bodyFormData}
            onAdd={() => addKeyValue('bodyFormData')}
            onRemove={(id) => removeKeyValue('bodyFormData', id)}
            onChange={(id, patch) => upsertKeyValue('bodyFormData', id, patch)}
          />
        )}

        {bodyType === 'x-www-form-urlencoded' && (
          <KeyValueEditor
            title="Url Encoded"
            addLabel="添加字段"
            items={bodyUrlEncoded}
            onAdd={() => addKeyValue('bodyUrlEncoded')}
            onRemove={(id) => removeKeyValue('bodyUrlEncoded', id)}
            onChange={(id, patch) => upsertKeyValue('bodyUrlEncoded', id, patch)}
          />
        )}

        {showBodyValueInput && (bodyType === 'json' || bodyType === 'raw') && (
          <label className="block">
            <div className="mb-1 text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">Body 内容</div>
            <Textarea
              value={bodyType === 'json' ? bodyJson : bodyRaw}
              onChange={(event) => {
                if (bodyType === 'json') {
                  syncNodeData({ bodyJson: event.target.value });
                } else {
                  syncNodeData({ bodyRaw: event.target.value });
                }
              }}
              placeholder={bodyType === 'json' ? '{\n  "key": "value"\n}' : 'Raw body text'}
              rows={5}
              className="min-h-[120px]"
            />
          </label>
        )}

        {bodyType === 'binary' && (
          <div className="block">
            <div className="mb-1 text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">Binary 变量</div>
            <SimpleSelect
              items={variableItems}
              defaultValue={bodyBinaryVariable}
              allowSearch={false}
              className="w-full"
              onSelect={(item) => syncNodeData({ bodyBinaryVariable: String(item.value) })}
            />
          </div>
        )}
      </section>

      <section className="space-y-3 rounded-xl bg-muted/15 px-4 py-4">
        <div className="text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">超时设置 (ms)</div>
        <div className="grid gap-3 md:grid-cols-3">
          <label className="block">
            <div className="mb-1 text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">连接超时</div>
            <input
              type="number"
              min={0}
              step={100}
              value={timeoutConnectMs}
              onChange={(event) => {
                const value = Number.parseInt(event.target.value, 10);
                syncNodeData({ timeoutConnectMs: Number.isFinite(value) && value >= 0 ? value : 0 });
              }}
              className={inputClassName}
            />
          </label>
          <label className="block">
            <div className="mb-1 text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">读取超时</div>
            <input
              type="number"
              min={0}
              step={100}
              value={timeoutReadMs}
              onChange={(event) => {
                const value = Number.parseInt(event.target.value, 10);
                syncNodeData({ timeoutReadMs: Number.isFinite(value) && value >= 0 ? value : 0 });
              }}
              className={inputClassName}
            />
          </label>
          <label className="block">
            <div className="mb-1 text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">写入超时</div>
            <input
              type="number"
              min={0}
              step={100}
              value={timeoutWriteMs}
              onChange={(event) => {
                const value = Number.parseInt(event.target.value, 10);
                syncNodeData({ timeoutWriteMs: Number.isFinite(value) && value >= 0 ? value : 0 });
              }}
              className={inputClassName}
            />
          </label>
        </div>
      </section>

      <section className="space-y-3 rounded-xl bg-muted/15 px-4 py-4">
        <div className="text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">失败重试</div>

        <label className="flex items-start gap-3 rounded-lg border border-[var(--border)] bg-background px-3 py-3">
          <Checkbox
            checked={retryOnFailure}
            onChange={(event) => syncNodeData({ retryOnFailure: event.target.checked })}
            className="mt-0.5"
          />
          <span className="min-w-0">
            <span className="block text-sm font-medium text-foreground">失败后重试</span>
            <span className="mt-1 block text-xs leading-5 text-muted-foreground">
              开启后，当请求失败时会按配置进行重试。
            </span>
          </span>
        </label>

        {retryOnFailure && (
          <div className="grid gap-3 md:grid-cols-2">
            <label className="block">
              <div className="mb-1 text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">最大重试次数</div>
              <input
                type="number"
                min={1}
                step={1}
                value={retryCount}
                onChange={(event) => {
                  const value = Number.parseInt(event.target.value, 10);
                  syncNodeData({ retryCount: Number.isFinite(value) && value > 0 ? value : 1 });
                }}
                className={inputClassName}
              />
            </label>
            <label className="block">
              <div className="mb-1 text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">重试间隔 (ms)</div>
              <input
                type="number"
                min={0}
                step={100}
                value={retryIntervalMs}
                onChange={(event) => {
                  const value = Number.parseInt(event.target.value, 10);
                  syncNodeData({ retryIntervalMs: Number.isFinite(value) && value >= 0 ? value : 0 });
                }}
                className={inputClassName}
              />
            </label>
          </div>
        )}
      </section>

      <section className="space-y-3 rounded-xl bg-muted/15 px-4 py-4">
        <div className="text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">异常处理</div>
        <SimpleSelect
          items={EXCEPTION_STRATEGY_ITEMS}
          defaultValue={exceptionStrategy}
          allowSearch={false}
          className="w-full"
          onSelect={(item) => syncNodeData({ exceptionStrategy: item.value as HttpExceptionStrategy })}
        />

        {exceptionStrategy === 'return-default' && (
          <label className="block">
            <div className="mb-1 text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">默认返回值</div>
            <Textarea
              value={exceptionDefaultValue}
              onChange={(event) => syncNodeData({ exceptionDefaultValue: event.target.value })}
              placeholder="例如："
              rows={3}
              className="min-h-[88px]"
            />
          </label>
        )}
      </section>

      <section className="space-y-3 rounded-xl bg-muted/15 px-4 py-4">
        <label className="block">
          <div className="mb-1 text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">输出变量名</div>
          <input
            value={outputVariableName}
            onChange={(event) => syncNodeData({ outputVariableName: event.target.value })}
            placeholder="例如: httpResponse"
            className={inputClassName}
          />
        </label>
      </section>
    </div>
  );
};

export default HttpRequestPanel;
