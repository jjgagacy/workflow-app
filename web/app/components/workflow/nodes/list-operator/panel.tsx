import { NodeInput } from "../../components/base/node-input";
import { useWorkflowStore } from "../../context";
import { useNodesUpdate } from "../../hooks/use-nodesUpdate";
import type { Node } from "../../types";
import { createListOperatorCondition, DEFAULT_LIST_OPERATOR_OUTPUT_VARIABLE_NAME, normalizeListOperatorConditions } from "./data";
import type {
  ListOperatorCondition,
  ListOperatorLogicalOperator,
  ListOperatorNodeData,
} from "./types";
import { useListOperatorOptions } from "./hooks";
import ListOperatorHeader from "./components/header";
import ArrayVariableSelector from "./components/variable-selector";
import ConditionList from "./components/condition-list";
import PaginationSettings from "./components/pagination";
import SortSettings from "./components/sort";

type ListOperatorPanelProps = {
  node: Node<ListOperatorNodeData>;
};

const isArrayType = (typeLabel?: string) => {
  const normalized = String(typeLabel ?? '').trim().toLowerCase();
  if (!normalized) {
    return false;
  }

  return normalized === 'array' || normalized.includes('array');
};


const ListOperatorPanel = ({ node }: ListOperatorPanelProps) => {
  const updateActivePanelNode = useWorkflowStore((state) => state.updateActivePanelNode);
  const { onNodeDataUpdate } = useNodesUpdate();
  const { conditionOperatorItems, sortOrderItems } = useListOperatorOptions();

  const inputVariable = node.data.inputVariable ?? '';
  const logicalOperator = (node.data.logicalOperator ?? 'and') as ListOperatorLogicalOperator;
  const conditions = normalizeListOperatorConditions(node.data.conditions);
  const firstN = Math.max(0, Number(node.data.firstN) || 0);
  const lastN = Math.max(0, Number(node.data.lastN) || 0);
  const enableSort = Boolean(node.data.enableSort);
  const sortOrder = node.data.sortOrder === 'desc' ? 'desc' : 'asc';
  const outputVariableName = node.data.outputVariableName ?? DEFAULT_LIST_OPERATOR_OUTPUT_VARIABLE_NAME;

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

  const handleToggleLogicalOperator = () => {
    const nextOperator = logicalOperator === 'and' ? 'or' : 'and';
    syncNodeData({ logicalOperator: nextOperator as ListOperatorLogicalOperator });
  };

  return (
    <div className="space-y-0">
      <ListOperatorHeader label={node.data.label} />

      <ArrayVariableSelector
        nodeId={node.id}
        inputVariable={inputVariable}
        onSelect={(value) => syncNodeData({ inputVariable: value })}
      />

      <ConditionList
        conditions={conditions}
        logicalOperator={logicalOperator}
        conditionOperatorItems={conditionOperatorItems}
        onToggleLogicalOperator={handleToggleLogicalOperator}
        onAddCondition={addCondition}
        onUpdateCondition={upsertCondition}
        onRemoveCondition={removeCondition}
      />

      <PaginationSettings
        firstN={firstN}
        lastN={lastN}
        onFirstNChange={(value) => syncNodeData({ firstN: value })}
        onLastNChange={(value) => syncNodeData({ lastN: value })}
      />

      <SortSettings
        enableSort={enableSort}
        sortOrder={sortOrder}
        sortOrderItems={sortOrderItems}
        onToggleSort={(enabled) => syncNodeData({ enableSort: enabled })}
        onSortOrderChange={(order) => syncNodeData({ sortOrder: order })}
      />

      <section className="space-y-3 rounded-xl bg-muted/15 px-4 py-4">
        <label className="block">
          <div className="mb-1 text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">输出变量名</div>
          <NodeInput
            value={outputVariableName}
            onChange={(event) => syncNodeData({ outputVariableName: event.target.value })}
            placeholder=""
          />
        </label>
      </section>
    </div>
  );
};

export default ListOperatorPanel;