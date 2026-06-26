import { useMemo } from "react";
import { CirclePlus, Trash2 } from "lucide-react";
import { useStoreApi } from "@xyflow/react";
import { useTranslation } from "react-i18next";
import { Checkbox } from "@/app/ui/checkbox";
import { SimpleSelect } from "@/app/ui/select";
import { Textarea } from "@/app/ui/textarea";
import {
  buildVariableSelectItems,
  buildWorkflowVariableOptions,
} from "../../components/nodes-shared/variable-select";
import {
  getWorkflowModelById,
  getWorkflowModelSelectItems,
} from "../../components/nodes-shared/model-options";
import { useWorkflowStore } from "../../context";
import { useNodesUpdate } from "../../hooks/use-nodesUpdate";
import { VariableDataType } from "../../types";
import type { Node } from "../../types";
import {
  createParameterExtractorItem,
  normalizeParameterExtractorItems,
} from "./data";
import type { ParameterExtractorItem, ParameterExtractorNodeData } from "./types";

type ParameterExtractorPanelProps = {
  node: Node<ParameterExtractorNodeData>;
};

type SelectItem = {
  value: string;
  name: string;
  description?: string;
  group?: string;
};

const inputClassName = 'w-full rounded-md border border-[var(--border)] bg-background px-3 py-2 text-sm text-foreground outline-none transition-colors focus:border-primary/60';

const PARAMETER_TYPE_OPTIONS: SelectItem[] = [
  { value: VariableDataType.string, name: 'string' },
  { value: VariableDataType.number, name: 'number' },
  { value: VariableDataType.boolean, name: 'boolean' },
  { value: VariableDataType.array, name: 'array' },
  { value: VariableDataType.object, name: 'object' },
  { value: VariableDataType.file, name: 'file' },
  { value: VariableDataType.any, name: 'any' },
];

const ParameterExtractorPanel = ({ node }: ParameterExtractorPanelProps) => {
  const { t } = useTranslation();
  const store = useStoreApi();
  const updateActivePanelNode = useWorkflowStore((state) => state.updateActivePanelNode);
  const chatEnvVariables = useWorkflowStore((state) => state.chatEnvVariables);
  const envVariables = useWorkflowStore((state) => state.envVariables);
  const { onNodeDataUpdate } = useNodesUpdate();

  const modelId = node.data.modelId ?? '';
  const inputVariable = node.data.inputVariable ?? '';
  const enableVision = Boolean(node.data.enableVision);
  const parameters = normalizeParameterExtractorItems(node.data.parameters);
  const outputVariableName = node.data.outputVariableName ?? 'extractedParameters';
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

  const syncNodeData = (patch: Partial<ParameterExtractorNodeData>) => {
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

  const upsertParameter = (parameterId: string, patch: Partial<ParameterExtractorItem>) => {
    const nextParameters = parameters.map((item) => {
      if (item.id !== parameterId) {
        return item;
      }

      return {
        ...item,
        ...patch,
      };
    });

    syncNodeData({ parameters: nextParameters });
  };

  const addParameter = () => {
    syncNodeData({
      parameters: [...parameters, createParameterExtractorItem()],
    });
  };

  const removeParameter = (parameterId: string) => {
    const nextParameters = parameters.filter((item) => item.id !== parameterId);
    syncNodeData({
      parameters: nextParameters.length ? nextParameters : [createParameterExtractorItem()],
    });
  };

  return (
    <div className="space-y-4">
      <div className="rounded-lg bg-muted/20 px-4 py-3">
        <div className="text-sm font-semibold text-foreground">{node.data.label?.trim() || 'Parameter Extractor'}</div>
        <div className="mt-1 text-xs leading-5 text-muted-foreground">
          使用大模型从输入内容中提取结构化参数。
        </div>
        <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
          <span className="rounded-full bg-background px-2.5 py-1">
            {model ? `${model.provider} / ${model.name}` : '未选择模型'}
          </span>
          <span className="rounded-full bg-background px-2.5 py-1">参数 {parameters.length}</span>
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
              开启后可在输入包含图片时辅助参数提取。
            </span>
          </span>
        </label>
      </section>

      <section className="space-y-3 rounded-xl bg-muted/15 px-4 py-4">
        <div className="flex items-center justify-between gap-2">
          <div className="text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">要提取的参数</div>
          <button
            type="button"
            onClick={addParameter}
            className="inline-flex items-center gap-1.5 rounded-md border border-[var(--border)] bg-background px-2.5 py-1.5 text-xs text-foreground transition-colors hover:bg-muted/70"
          >
            <CirclePlus className="h-3.5 w-3.5" />
            添加参数
          </button>
        </div>

        <div className="space-y-2">
          {parameters.map((item, index) => {
            const missingDescription = !item.description?.trim();

            return (
              <div key={item.id} className="rounded-lg border border-[var(--border)] bg-background px-3 py-3">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <div className="text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">参数 {index + 1}</div>
                  <button
                    type="button"
                    onClick={() => removeParameter(item.id)}
                    className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground"
                    aria-label="删除参数"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>

                <div className="grid gap-3 md:grid-cols-2">
                  <label className="block">
                    <div className="mb-1 text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">参数名称</div>
                    <input
                      value={item.name}
                      onChange={(event) => upsertParameter(item.id, { name: event.target.value })}
                      placeholder="例如: orderId"
                      className={inputClassName}
                    />
                  </label>

                  <div className="block">
                    <div className="mb-1 text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">参数类型</div>
                    <SimpleSelect
                      items={PARAMETER_TYPE_OPTIONS}
                      defaultValue={item.type}
                      allowSearch={false}
                      className="w-full"
                      onSelect={(selected) => upsertParameter(item.id, { type: selected.value as VariableDataType })}
                    />
                  </div>
                </div>

                <label className="mt-3 block">
                  <div className="mb-1 text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">参数描述 (必填)</div>
                  <Textarea
                    value={item.description}
                    onChange={(event) => upsertParameter(item.id, { description: event.target.value })}
                    placeholder="描述该参数应如何从文本中提取，例如：订单号通常是以 ORD 开头的 10 位字符串。"
                    rows={3}
                    className={missingDescription ? 'min-h-[88px] border-destructive focus-visible:ring-destructive/30' : 'min-h-[88px]'}
                  />
                  {missingDescription && (
                    <div className="mt-1 text-xs text-destructive">参数描述必填，模型将依据该描述进行提取。</div>
                  )}
                </label>
              </div>
            );
          })}
        </div>
      </section>

      <section className="space-y-3 rounded-xl bg-muted/15 px-4 py-4">
        <label className="block">
          <div className="mb-1 text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">输出变量名</div>
          <input
            value={outputVariableName}
            onChange={(event) => syncNodeData({ outputVariableName: event.target.value })}
            placeholder="例如: extractedParameters"
            className={inputClassName}
          />
        </label>
      </section>
    </div>
  );
};

export default ParameterExtractorPanel;
