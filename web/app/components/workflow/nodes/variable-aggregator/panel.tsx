import { useMemo } from "react";
import { CirclePlus, Trash2 } from "lucide-react";
import { useStoreApi } from "@xyflow/react";
import { useTranslation } from "react-i18next";
import { SimpleSelect } from "@/app/ui/select";
import { buildVariableSelectItems, buildWorkflowVariableOptions } from "../../components/nodes-shared/variable-select";
import { useNodesUpdate } from "../../hooks/use-nodesUpdate";
import { useWorkflowStore } from "../../context";
import { Node } from "../../types";
import { createVariableAggregatorItem } from "./data";
import type {
  VariableAggregatorItem,
  VariableAggregatorNodeData,
} from "./types";

type VariableAggregatorPanelProps = {
  node: Node<VariableAggregatorNodeData>;
};

type SelectItem = {
  value: string;
  name: string;
  description?: string;
  group?: string;
};

const inputClassName = 'w-full rounded-md border border-[var(--border)] bg-background px-3 py-2 text-sm text-foreground outline-none transition-colors focus:border-primary/60';

const VariableAggregatorPanel = ({ node }: VariableAggregatorPanelProps) => {
  const { t } = useTranslation();
  const store = useStoreApi();
  const updateActivePanelNode = useWorkflowStore((state) => state.updateActivePanelNode);
  const chatEnvVariables = useWorkflowStore((state) => state.chatEnvVariables);
  const envVariables = useWorkflowStore((state) => state.envVariables);
  const { onNodeDataUpdate } = useNodesUpdate();

  const variables = node.data.variables ?? [];
  const outputName = node.data.outputName ?? 'aggregated';

  const syncNodeData = (patch: Partial<VariableAggregatorNodeData>) => {
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

  const upsertVariable = (variableId: string, patch: Partial<VariableAggregatorItem>) => {
    const nextVariables = variables.map((item) => {
      if (item.id !== variableId) {
        return item;
      }

      return {
        ...item,
        ...patch,
      };
    });

    syncNodeData({ variables: nextVariables });
  };

  const addVariable = () => {
    syncNodeData({ variables: [...variables, createVariableAggregatorItem()] });
  };

  const removeVariable = (variableId: string) => {
    syncNodeData({ variables: variables.filter((item) => item.id !== variableId) });
  };

  return (
    <div className="space-y-4">
      <div className="rounded-lg bg-muted/20 px-4 py-3">
        <div className="text-sm font-semibold text-foreground">{node.data.label?.trim() || 'Variable Aggregator'}</div>
        <div className="mt-1 text-xs leading-5 text-muted-foreground">
          配置多个变量后聚合输出为一个对象结果。
        </div>
        <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
          <span className="rounded-full bg-background px-2.5 py-1">聚合变量 {variables.length}</span>
          <span className="rounded-full bg-background px-2.5 py-1">输出 {outputName}</span>
        </div>
      </div>

      <section className="space-y-3 rounded-xl bg-muted/15 px-4 py-4">
        <div className="flex items-center justify-between gap-2">
          <div className="text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">变量列表</div>
          <button
            type="button"
            onClick={addVariable}
            className="inline-flex items-center gap-1.5 rounded-md border border-[var(--border)] bg-background px-2.5 py-1.5 text-xs text-foreground transition-colors hover:bg-muted/70"
          >
            <CirclePlus className="h-3.5 w-3.5" />
            添加变量
          </button>
        </div>

        {variables.length === 0 ? (
          <div className="rounded-md border border-dashed border-[var(--border)] bg-background px-3 py-2 text-xs text-muted-foreground">
            暂无聚合变量，可点击上方按钮添加。
          </div>
        ) : (
          <div className="space-y-2">
            {variables.map((item, index) => {
              const valueItems = buildVariableSelectItems({
                t,
                currentValue: String(item.valueSource ?? ''),
                options: variableOptions,
              });

              return (
                <div key={item.id} className="rounded-lg border border-[var(--border)] bg-background px-3 py-3">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <div className="text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">变量 {index + 1}</div>
                    <button
                      type="button"
                      onClick={() => removeVariable(item.id)}
                      className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground"
                      aria-label="删除聚合变量"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  <div className="block">
                    <div className="mb-1 text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">变量</div>
                    <SimpleSelect
                      items={valueItems}
                      defaultValue={item.valueSource}
                      allowSearch={false}
                      className="w-full"
                      onSelect={(selected) => upsertVariable(item.id, { valueSource: String(selected.value) })}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <section className="space-y-3 rounded-xl bg-muted/15 px-4 py-4">
        <label className="block">
          <div className="mb-1 text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">输出变量名</div>
          <input
            value={outputName}
            onChange={(event) => syncNodeData({ outputName: event.target.value })}
            placeholder="例如: aggregated"
            className={inputClassName}
          />
        </label>
      </section>
    </div>
  );
};

export default VariableAggregatorPanel;
