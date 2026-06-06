import { useMemo } from "react";
import { CirclePlus, Trash2 } from "lucide-react";
import { useStoreApi } from "@xyflow/react";
import { useTranslation } from "react-i18next";
import { Checkbox } from "@/app/ui/checkbox";
import { SimpleSelect } from "@/app/ui/select";
import { buildVariableSelectItems, buildWorkflowVariableOptions } from "../../components/nodes-shared/variable-select";
import { useWorkflowStore } from "../../context";
import { useNodesUpdate } from "../../hooks/use-nodesUpdate";
import type { Node } from "../../types";
import { createListOperatorCondition, normalizeListOperatorConditions } from "./data";
import type {
  ListOperatorCondition,
  ListOperatorLogicalOperator,
  ListOperatorNodeData,
  ListStringConditionOperator,
} from "./types";

type ListOperatorPanelProps = {
  node: Node<ListOperatorNodeData>;
};

type SelectItem = {
  value: string;
  name: string;
  description?: string;
  group?: string;
};

const inputClassName = 'w-full rounded-md border border-[var(--border)] bg-background px-3 py-2 text-sm text-foreground outline-none transition-colors focus:border-primary/60';

const isArrayType = (typeLabel?: string) => {
  const normalized = String(typeLabel ?? '').trim().toLowerCase();
  if (!normalized) {
    return false;
  }

  return normalized === 'array' || normalized.includes('array');
};

const CONDITION_OPERATOR_ITEMS: SelectItem[] = [
  { value: 'contains', name: '包含' },
  { value: 'not_contains', name: '不包含' },
  { value: 'equals', name: '等于' },
  { value: 'not_equals', name: '不等于' },
  { value: 'starts_with', name: '开头是' },
  { value: 'ends_with', name: '结尾是' },
  { value: 'is_empty', name: '为空' },
  { value: 'is_not_empty', name: '不为空' },
];

const LOGICAL_OPERATOR_ITEMS: SelectItem[] = [
  { value: 'and', name: 'AND' },
  { value: 'or', name: 'OR' },
];

const SORT_ORDER_ITEMS: SelectItem[] = [
  { value: 'asc', name: '升序 (ASC)' },
  { value: 'desc', name: '降序 (DESC)' },
];

const ListOperatorPanel = ({ node }: ListOperatorPanelProps) => {
  const { t } = useTranslation();
  const store = useStoreApi();
  const updateActivePanelNode = useWorkflowStore((state) => state.updateActivePanelNode);
  const chatEnvVariables = useWorkflowStore((state) => state.chatEnvVariables);
  const envVariables = useWorkflowStore((state) => state.envVariables);
  const { onNodeDataUpdate } = useNodesUpdate();

  const inputVariable = node.data.inputVariable ?? '';
  const logicalOperator = (node.data.logicalOperator ?? 'and') as ListOperatorLogicalOperator;
  const conditions = normalizeListOperatorConditions(node.data.conditions);
  const firstN = Math.max(0, Number(node.data.firstN) || 0);
  const lastN = Math.max(0, Number(node.data.lastN) || 0);
  const enableSort = Boolean(node.data.enableSort);
  const sortOrder = node.data.sortOrder === 'desc' ? 'desc' : 'asc';
  const outputVariableName = node.data.outputVariableName ?? 'listResult';

  const syncNodeData = (patch: Partial<ListOperatorNodeData>) => {
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

  const arrayVariableItems = useMemo(() => {
    const nodes = store.getState().nodes as Node[];
    const variableOptions = buildWorkflowVariableOptions({
      t,
      nodeId: node.id,
      nodes,
      envVariables,
      chatEnvVariables,
    });

    const filteredOptions = variableOptions.filter((option) => isArrayType(option.description));

    return buildVariableSelectItems({
      t,
      currentValue: inputVariable,
      options: filteredOptions,
    });
  }, [chatEnvVariables, envVariables, inputVariable, node.id, store, t]);

  const upsertCondition = (conditionId: string, patch: Partial<ListOperatorCondition>) => {
    const nextConditions = conditions.map((condition) => {
      if (condition.id !== conditionId) {
        return condition;
      }

      return {
        ...condition,
        ...patch,
      };
    });

    syncNodeData({ conditions: nextConditions });
  };

  const addCondition = () => {
    syncNodeData({ conditions: [...conditions, createListOperatorCondition()] });
  };

  const removeCondition = (conditionId: string) => {
    const nextConditions = conditions.filter((condition) => condition.id !== conditionId);
    syncNodeData({
      conditions: nextConditions.length ? nextConditions : [createListOperatorCondition()],
    });
  };

  return (
    <div className="space-y-4">
      <div className="rounded-lg bg-muted/20 px-4 py-3">
        <div className="text-sm font-semibold text-foreground">{node.data.label?.trim() || 'List Operator'}</div>
        <div className="mt-1 text-xs leading-5 text-muted-foreground">
          对数组变量执行过滤、截取前后 N 项与排序操作。
        </div>
        <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
          <span className="rounded-full bg-background px-2.5 py-1">过滤条件 {conditions.length}</span>
          <span className="rounded-full bg-background px-2.5 py-1">前N {firstN}</span>
          <span className="rounded-full bg-background px-2.5 py-1">后N {lastN}</span>
          <span className="rounded-full bg-background px-2.5 py-1">{enableSort ? `排序 ${sortOrder.toUpperCase()}` : '不排序'}</span>
        </div>
      </div>

      <section className="space-y-3 rounded-xl bg-muted/15 px-4 py-4">
        <div className="text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">数组变量</div>
        <SimpleSelect
          items={arrayVariableItems}
          defaultValue={inputVariable}
          allowSearch={false}
          className="w-full"
          onSelect={(item) => syncNodeData({ inputVariable: String(item.value) })}
        />
      </section>

      <section className="space-y-3 rounded-xl bg-muted/15 px-4 py-4">
        <div className="flex items-center justify-between gap-2">
          <div className="text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">过滤条件</div>
          <button
            type="button"
            onClick={addCondition}
            className="inline-flex items-center gap-1.5 rounded-md border border-[var(--border)] bg-background px-2.5 py-1.5 text-xs text-foreground transition-colors hover:bg-muted/70"
          >
            <CirclePlus className="h-3.5 w-3.5" />
            添加条件
          </button>
        </div>

        <div className="max-w-[180px]">
          <div className="mb-1 text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">条件关系</div>
          <SimpleSelect
            items={LOGICAL_OPERATOR_ITEMS}
            defaultValue={logicalOperator}
            allowSearch={false}
            className="w-full"
            onSelect={(item) => syncNodeData({ logicalOperator: item.value as ListOperatorLogicalOperator })}
          />
        </div>

        <div className="space-y-2">
          {conditions.map((condition, index) => {
            const isUnary = condition.operator === 'is_empty' || condition.operator === 'is_not_empty';

            return (
              <div key={condition.id} className="rounded-lg border border-[var(--border)] bg-background px-3 py-3">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <div className="text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">条件 {index + 1}</div>
                  <button
                    type="button"
                    onClick={() => removeCondition(condition.id)}
                    className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground"
                    aria-label="删除条件"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>

                <div className="grid gap-3 md:grid-cols-2">
                  <div className="block">
                    <div className="mb-1 text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">操作符</div>
                    <SimpleSelect
                      items={CONDITION_OPERATOR_ITEMS}
                      defaultValue={condition.operator}
                      allowSearch={false}
                      className="w-full"
                      onSelect={(item) => upsertCondition(condition.id, { operator: item.value as ListStringConditionOperator })}
                    />
                  </div>

                  {!isUnary ? (
                    <label className="block">
                      <div className="mb-1 text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">比较值</div>
                      <input
                        value={condition.value}
                        onChange={(event) => upsertCondition(condition.id, { value: event.target.value })}
                        placeholder="例如: vip"
                        className={inputClassName}
                      />
                    </label>
                  ) : (
                    <div className="rounded-md bg-muted/20 px-3 py-2 text-sm text-muted-foreground">
                      该操作符无需输入比较值。
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="grid gap-3 rounded-xl bg-muted/15 px-4 py-4 md:grid-cols-2">
        <label className="block">
          <div className="mb-1 text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">获取前 N 项</div>
          <input
            type="number"
            min={0}
            step={1}
            value={firstN}
            onChange={(event) => {
              const value = Number.parseInt(event.target.value, 10);
              syncNodeData({ firstN: Number.isFinite(value) && value >= 0 ? value : 0 });
            }}
            className={inputClassName}
          />
        </label>

        <label className="block">
          <div className="mb-1 text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">获取后 N 项</div>
          <input
            type="number"
            min={0}
            step={1}
            value={lastN}
            onChange={(event) => {
              const value = Number.parseInt(event.target.value, 10);
              syncNodeData({ lastN: Number.isFinite(value) && value >= 0 ? value : 0 });
            }}
            className={inputClassName}
          />
        </label>
      </section>

      <section className="space-y-3 rounded-xl bg-muted/15 px-4 py-4">
        <div className="text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">排序</div>

        <label className="flex items-start gap-3 rounded-lg border border-[var(--border)] bg-background px-3 py-3">
          <Checkbox
            checked={enableSort}
            onChange={(event) => syncNodeData({ enableSort: event.target.checked })}
            className="mt-0.5"
          />
          <span className="min-w-0">
            <span className="block text-sm font-medium text-foreground">启用排序</span>
            <span className="mt-1 block text-xs leading-5 text-muted-foreground">
              按列表项字符串值进行排序。
            </span>
          </span>
        </label>

        {enableSort && (
          <div className="max-w-[220px]">
            <div className="mb-1 text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">排序方向</div>
            <SimpleSelect
              items={SORT_ORDER_ITEMS}
              defaultValue={sortOrder}
              allowSearch={false}
              className="w-full"
              onSelect={(item) => syncNodeData({ sortOrder: item.value as 'asc' | 'desc' })}
            />
          </div>
        )}
      </section>

      <section className="space-y-3 rounded-xl bg-muted/15 px-4 py-4">
        <label className="block">
          <div className="mb-1 text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">输出变量名</div>
          <input
            value={outputVariableName}
            onChange={(event) => syncNodeData({ outputVariableName: event.target.value })}
            placeholder="例如: listResult"
            className={inputClassName}
          />
        </label>
      </section>
    </div>
  );
};

export default ListOperatorPanel;
