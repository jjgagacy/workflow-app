import { useMemo } from "react";
import { CirclePlus, Trash2 } from "lucide-react";
import { useStoreApi } from "@xyflow/react";
import { useTranslation } from "react-i18next";
import { Checkbox } from "@/app/ui/checkbox";
import { SimpleSelect } from "@/app/ui/select";
import { buildVariableSelectItems, buildWorkflowVariableOptions } from "../../components/nodes-shared/variable-select";
import { useNodesUpdate } from "../../hooks/use-nodesUpdate";
import { useWorkflowStore } from "../../context";
import { CodeLanguage, Node, VariableDataType } from "../../types";
import { createCodeInputParameter, createCodeOutputVariable } from "./data";
import type {
  CodeExceptionStrategy,
  CodeInputParameter,
  CodeNodeData,
  CodeOutputVariable,
} from "./types";
import { CodeEditor } from "../../components/code-editor";
import { useConfig } from "./hooks/use-config";

type CodePanelProps = {
  node: Node<CodeNodeData>;
};

type SelectItem = {
  value: string;
  name: string;
  description?: string;
  group?: string;
};

const inputClassName = 'w-full rounded-md border border-[var(--border)] bg-background px-3 py-2 text-sm text-foreground outline-none transition-colors focus:border-primary/60';

const CodePanel = ({ node }: CodePanelProps) => {
  const { t } = useTranslation();
  const store = useStoreApi();
  const updateActivePanelNode = useWorkflowStore((state) => state.updateActivePanelNode);
  const chatEnvVariables = useWorkflowStore((state) => state.chatEnvVariables);
  const envVariables = useWorkflowStore((state) => state.envVariables);
  const { onNodeDataUpdate } = useNodesUpdate();
  const xx = useConfig(node.id, node.data);

  const syncNodeData = (patch: Partial<CodeNodeData>) => {
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

  const nodeData = node.data;
  // console.log('nodeData:', nodeData);

  const inputParameters = node.data.inputs ?? [];
  const outputVariables = node.data.outputs ?? [];
  const retryOnFailure = Boolean(node.data.retryOnFailure);
  const retryCount = Math.max(1, Number(node.data.retryCount) || 1);
  const exceptionStrategy = node.data.exceptionStrategy || 'stop-execution';
  const exceptionDefaultValue = node.data.exceptionDefaultValue ?? '';

  const variableOptions = useMemo(() => {
    const nodes = store.getState().nodes as Node[];

    return buildWorkflowVariableOptions({
      t,
      nodeId: node.id,
      nodes,
      envVariables,
      chatEnvVariables,
    });
  }, [chatEnvVariables, envVariables, node.id, store, t]);

  const exceptionStrategyItems: SelectItem[] = [
    {
      value: 'stop-execution',
      name: '停止执行',
      description: '代码执行异常时立即停止当前执行。',
    },
    {
      value: 'return-default',
      name: '默认值返回',
      description: '代码执行异常时返回默认值。',
    },
  ];

  const outputTypeItems: SelectItem[] = Object.values(VariableDataType).map((value) => ({
    value,
    name: value,
  }));

  const upsertInputParameter = (parameterId: string, patch: Partial<CodeInputParameter>) => {
    const nextInputParameters = inputParameters.map((item) => {
      if (item.id !== parameterId) {
        return item;
      }

      return {
        ...item,
        ...patch,
      };
    });

    syncNodeData({ inputs: nextInputParameters });
  };

  const removeInputParameter = (parameterId: string) => {
    const nextInputParameters = inputParameters.filter((item) => item.id !== parameterId);
    syncNodeData({ inputs: nextInputParameters });
  };

  const addInputParameter = () => {
    syncNodeData({
      inputs: [...inputParameters, createCodeInputParameter()],
    });
  };

  const upsertOutputVariable = (outputId: string, patch: Partial<CodeOutputVariable>) => {
    const nextOutputVariablesMap: Record<string, CodeOutputVariable> = {};
    Object.entries(outputVariables).forEach(([key, item]) => {
      if (item.id === outputId) {
        nextOutputVariablesMap[key] = {
          ...item,
          ...patch,
        };
      } else {
        nextOutputVariablesMap[key] = item;
      }
    });
    const nextOutputVariables = nextOutputVariablesMap;
    syncNodeData({ outputs: nextOutputVariables });
  };

  const removeOutputVariable = (outputId: string) => {
    const nextOutputVariables = Object.fromEntries(
      Object.entries(outputVariables).filter(([key, item]) => item.id !== outputId)
    );
    syncNodeData({ outputs: nextOutputVariables });
  };

  const addOutputVariable = () => {
    syncNodeData({
      outputs: {
        ...outputVariables,
        ...createCodeOutputVariable(),
      },
    });
  };

  return (
    <div className="space-y-4">
      <div className="rounded-lg bg-muted/20 px-4 py-3">
        <div className="text-sm font-semibold text-foreground">{node.data.label?.trim() || 'Code'}</div>
        <div className="mt-1 text-xs leading-5 text-muted-foreground">
          管理输入变量映射、输出变量定义，以及代码异常处理策略。
        </div>
      </div>

      <section className="space-y-3 rounded-xl bg-muted/15 px-4 py-4">
        <div className="flex items-center justify-between gap-2">
          <div className="text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">输入变量</div>
          <button
            type="button"
            onClick={addInputParameter}
            className="inline-flex items-center gap-1.5 rounded-md border border-[var(--border)] bg-background px-2.5 py-1.5 text-xs text-foreground transition-colors hover:bg-muted/70"
          >
            <CirclePlus className="h-3.5 w-3.5" />
            添加参数
          </button>
        </div>

        {inputParameters.length === 0 ? (
          <div className="rounded-md border border-dashed border-[var(--border)] bg-background px-3 py-2 text-xs text-muted-foreground">
            暂无输入参数，可点击上方按钮添加。
          </div>
        ) : (
          <div className="space-y-2">
            {inputParameters.map((parameter, index) => {
              const valueItems = buildVariableSelectItems({
                t,
                currentValue: String(parameter.valueSource ?? ''),
                options: variableOptions,
              });

              return (
                <div key={parameter.id} className="rounded-lg border border-[var(--border)] bg-background px-3 py-3">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <div className="text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">
                      参数 {index + 1}
                    </div>
                    <button
                      type="button"
                      onClick={() => removeInputParameter(parameter.id)}
                      className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground"
                      aria-label="删除输入参数"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  <div className="grid gap-3 md:grid-cols-2">
                    <label className="block">
                      <div className="mb-1 text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">变量名称</div>
                      <input
                        value={parameter.name}
                        onChange={(event) => upsertInputParameter(parameter.id, { name: event.target.value })}
                        placeholder="例如: orderId"
                        className={inputClassName}
                      />
                    </label>

                    <div className="block md:col-span-1">
                      <div className="mb-1 text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">变量值</div>
                      <SimpleSelect
                        items={valueItems}
                        defaultValue={parameter.valueSource}
                        allowSearch={false}
                        className="w-full"
                        onSelect={(item) => upsertInputParameter(parameter.id, { valueSource: String(item.value) })}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <section className="space-y-3 rounded-xl bg-muted/15 px-4 py-4">
        <div className="text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">代码</div>
        <CodeEditor
          language={CodeLanguage.javascript}
          value={`function main({arg1, arg2}) {
    return {
        result: arg1 + arg2
    }
}`}
          onChange={(value) => syncNodeData({ code: value })}
        />
      </section>

      <section className="space-y-3 rounded-xl bg-muted/15 px-4 py-4">
        <div className="flex items-center justify-between gap-2">
          <div className="text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">输出变量</div>
          <button
            type="button"
            onClick={addOutputVariable}
            className="inline-flex items-center gap-1.5 rounded-md border border-[var(--border)] bg-background px-2.5 py-1.5 text-xs text-foreground transition-colors hover:bg-muted/70"
          >
            <CirclePlus className="h-3.5 w-3.5" />
            添加输出
          </button>
        </div>

        {Object.keys(outputVariables).length === 0 ? (
          <div className="rounded-md border border-dashed border-[var(--border)] bg-background px-3 py-2 text-xs text-muted-foreground">
            暂无输出变量，可点击上方按钮添加。
          </div>
        ) : (
          <div className="space-y-2">
            {Object.values(outputVariables).map((output, index) => (
              <div key={output.id} className="rounded-lg border border-[var(--border)] bg-background px-3 py-3">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <div className="text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">
                    输出 {index + 1}
                  </div>
                  <button
                    type="button"
                    onClick={() => removeOutputVariable(output.id)}
                    className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground"
                    aria-label="删除输出变量"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>

                <div className="grid gap-3 md:grid-cols-2">
                  <label className="block">
                    <div className="mb-1 text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">变量名称</div>
                    <input
                      value={output.name}
                      onChange={(event) => upsertOutputVariable(output.id, { name: event.target.value })}
                      placeholder="例如: parsedResult"
                      className={inputClassName}
                    />
                  </label>
                  <div className="block">
                    <div className="mb-1 text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">变量类型</div>
                    <SimpleSelect
                      items={outputTypeItems}
                      defaultValue={output.type}
                      allowSearch={false}
                      className="w-full"
                      onSelect={(item) => upsertOutputVariable(output.id, { type: item.value as VariableDataType })}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
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
              开启后，当代码执行失败时会自动重试。
            </span>
          </span>
        </label>

        {retryOnFailure && (
          <label className="block">
            <div className="mb-1 text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">最大重试次数</div>
            <input
              type="number"
              min={1}
              step={1}
              value={retryCount}
              onChange={(event) => {
                const numericValue = Number.parseInt(event.target.value, 10);
                syncNodeData({
                  retryCount: Number.isFinite(numericValue) && numericValue > 0 ? numericValue : 1,
                });
              }}
              className={inputClassName}
            />
          </label>
        )}
      </section>

      <section className="space-y-3 rounded-xl bg-muted/15 px-4 py-4">
        <div className="text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">代码异常处理</div>

        <div className="block">
          <SimpleSelect
            items={exceptionStrategyItems}
            defaultValue={exceptionStrategy}
            allowSearch={false}
            className="w-full"
            onSelect={(item) => syncNodeData({ exceptionStrategy: item.value as CodeExceptionStrategy })}
          />
        </div>

        {exceptionStrategy === 'return-default' && (
          <label className="block">
            <div className="mb-1 text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">默认返回值</div>
            <input
              value={exceptionDefaultValue}
              onChange={(event) => syncNodeData({ exceptionDefaultValue: event.target.value })}
              placeholder="例如: {} 或 null"
              className={inputClassName}
            />
          </label>
        )}
      </section>
    </div>
  );
};

export default CodePanel;
