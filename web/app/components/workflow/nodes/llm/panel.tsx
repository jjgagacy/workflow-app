import { useMemo } from "react";
import { useStoreApi } from "@xyflow/react";
import { useTranslation } from "react-i18next";
import { Checkbox } from "@/app/ui/checkbox";
import { SimpleSelect } from "@/app/ui/select";
import { Textarea } from "@/app/ui/textarea";
import { buildVariableSelectItems, buildWorkflowVariableOptions } from "../../components/nodes-shared/variable-select";
import {
  getWorkflowModelById,
  getWorkflowModelSelectItems,
} from "../../components/nodes-shared/model-options";
import { useWorkflowStore } from "../../context";
import { useNodesUpdate } from "../../hooks/use-nodesUpdate";
import type { Node } from "../../types";
import type { LLMExceptionStrategy, LLMNodeData } from "./types";

type LLMPanelProps = {
  node: Node<LLMNodeData>;
};

type SelectItem = {
  value: string;
  name: string;
  description?: string;
  group?: string;
};

const inputClassName = 'w-full rounded-md border border-[var(--border)] bg-background px-3 py-2 text-sm text-foreground outline-none transition-colors focus:border-primary/60';

const LLMPanel = ({ node }: LLMPanelProps) => {
  const { t } = useTranslation();
  const store = useStoreApi();
  const updateActivePanelNode = useWorkflowStore((state) => state.updateActivePanelNode);
  const chatEnvVariables = useWorkflowStore((state) => state.chatEnvVariables);
  const envVariables = useWorkflowStore((state) => state.envVariables);
  const { onNodeDataUpdate } = useNodesUpdate();

  const modelId = node.data.modelId ?? '';
  const inputVariable = node.data.inputVariable ?? '';
  const systemPrompt = node.data.systemPrompt ?? '';
  const userPrompt = node.data.userPrompt ?? '';
  const assistantPrompt = node.data.assistantPrompt ?? '';
  const enableVision = Boolean(node.data.enableVision);
  const retryOnFailure = Boolean(node.data.retryOnFailure);
  const retryCount = Math.max(1, Number(node.data.retryCount) || 1);
  const retryIntervalMs = Math.max(0, Number(node.data.retryIntervalMs) || 0);
  const exceptionStrategy = node.data.exceptionStrategy || 'stop-execution';
  const exceptionDefaultValue = node.data.exceptionDefaultValue ?? '';
  const model = getWorkflowModelById(modelId);

  const modelItems = getWorkflowModelSelectItems();

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
      currentValue: inputVariable,
      options: variableOptions,
    });
  }, [chatEnvVariables, envVariables, inputVariable, node.id, store, t]);

  const exceptionStrategyItems: SelectItem[] = [
    {
      value: 'stop-execution',
      name: '停止执行',
      description: '推理异常时立即停止当前执行。',
    },
    {
      value: 'return-default',
      name: '返回默认值',
      description: '推理异常时输出预设默认值。',
    },
  ];

  const syncNodeData = (patch: Partial<LLMNodeData>) => {
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

  return (
    <div className="space-y-4">
      <div className="rounded-lg bg-muted/20 px-4 py-3">
        <div className="text-sm font-semibold text-foreground">{node.data.label?.trim() || 'LLM'}</div>
        <div className="mt-1 text-xs leading-5 text-muted-foreground">
          选择模型并配置提示词，生成文本结果供后续节点使用。
        </div>
        <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
          <span className="rounded-full bg-background px-2.5 py-1">
            {model ? `${model.provider} / ${model.name}` : '未选择模型'}
          </span>
          <span className="rounded-full bg-background px-2.5 py-1">{enableVision ? '视觉已启用' : '视觉未启用'}</span>
        </div>
      </div>

      <section className="space-y-3 rounded-xl bg-muted/15 px-4 py-4">
        <div className="text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">大模型</div>
        <SimpleSelect
          items={modelItems}
          defaultValue={modelId}
          allowSearch={false}
          className="w-full"
          onSelect={(item) => syncNodeData({ modelId: String(item.value) })}
        />
      </section>

      <section className="space-y-3 rounded-xl bg-muted/15 px-4 py-4">
        <div className="text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">输入变量</div>
        <SimpleSelect
          items={variableItems}
          defaultValue={inputVariable}
          allowSearch={false}
          className="w-full"
          onSelect={(item) => syncNodeData({ inputVariable: String(item.value) })}
        />
      </section>

      <section className="space-y-3 rounded-xl bg-muted/15 px-4 py-4">
        <div className="text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">提示词</div>
        <label className="block">
          <div className="mb-1 text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">System Prompt</div>
          <Textarea
            value={systemPrompt}
            onChange={(event) => syncNodeData({ systemPrompt: event.target.value })}
            placeholder="定义助手的角色、边界和风格。"
            rows={3}
            className="min-h-[88px]"
          />
        </label>

        <label className="block">
          <div className="mb-1 text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">User Prompt</div>
          <Textarea
            value={userPrompt}
            onChange={(event) => syncNodeData({ userPrompt: event.target.value })}
            placeholder="输入用户提示词模板，可引用上方选择的变量。"
            rows={4}
            className="min-h-[104px]"
          />
        </label>

        <label className="block">
          <div className="mb-1 text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">Assistant Prompt</div>
          <Textarea
            value={assistantPrompt}
            onChange={(event) => syncNodeData({ assistantPrompt: event.target.value })}
            placeholder="可选，用于提供示例回答或额外引导。"
            rows={3}
            className="min-h-[88px]"
          />
        </label>
      </section>

      <section className="space-y-3 rounded-xl bg-muted/15 px-4 py-4">
        <div className="text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">视觉能力</div>
        <label className="flex items-start gap-3 rounded-lg border border-[var(--border)] bg-background px-3 py-3">
          <Checkbox
            checked={enableVision}
            onChange={(event) => syncNodeData({ enableVision: event.target.checked })}
            className="mt-0.5"
          />
          <span className="min-w-0">
            <span className="block text-sm font-medium text-foreground">启用视觉</span>
            <span className="mt-1 block text-xs leading-5 text-muted-foreground">
              开启后可处理包含图片内容的输入场景。
            </span>
          </span>
        </label>
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
              开启后，当 LLM 调用失败会按配置次数与间隔重试。
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
          items={exceptionStrategyItems}
          defaultValue={exceptionStrategy}
          allowSearch={false}
          className="w-full"
          onSelect={(item) => syncNodeData({ exceptionStrategy: item.value as LLMExceptionStrategy })}
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
    </div>
  );
};

export default LLMPanel;
