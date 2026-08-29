import { useTranslation } from "react-i18next";
import { NodeInput } from "../../components/base/node-input";
import { useNodeConfig } from "../../hooks/use-node-config";
import { useNodesUpdate } from "../../hooks/use-nodesUpdate";
import { useWorkflowStore } from "../../context";
import type { Node } from "../../types";
import { createVariableAggregatorItem, DEFAULT_AGGREGATOR_OUTPUT_NAME } from "./data";
import type {
  VariableAggregatorItem,
  VariableAggregatorNodeData,
} from "./types";
import VariableAggregatorHeaderInfo from "./header-info";
import VariableAggregatorVarList from "./var-list";

type VariableAggregatorPanelProps = {
  node: Node<VariableAggregatorNodeData>;
};

const VariableAggregatorPanel = ({ node }: VariableAggregatorPanelProps) => {
  const { t } = useTranslation();
  const updateActivePanelNode = useWorkflowStore((state) => state.updateActivePanelNode);
  const { availableNodes, nodeVariableList } = useNodeConfig(node.id);
  const { onNodeDataUpdate } = useNodesUpdate();

  const variables = node.data.variables ?? [];
  const outputName = node.data.outputName ?? DEFAULT_AGGREGATOR_OUTPUT_NAME;

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

  const hasDuplicateVariableSelector = (selector?: VariableAggregatorItem['valueSource'], ignoreId?: string) => {
    if (!selector?.nodeId || !selector.path?.length) {
      return false;
    }

    return variables.some((item) => {
      if (item.id === ignoreId || !item.valueSource) {
        return false;
      }

      return item.valueSource.nodeId === selector.nodeId
        && item.valueSource.path.length === selector.path.length
        && item.valueSource.path.every((pathItem, index) => pathItem === selector.path[index]);
    });
  };

  const upsertVariable = (variableId: string, patch: Partial<VariableAggregatorItem>) => {
    const nextSelector = patch.valueSource;
    if (nextSelector && hasDuplicateVariableSelector(nextSelector, variableId)) {
      return;
    }

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
    const candidate = createVariableAggregatorItem();
    if (candidate.valueSource && hasDuplicateVariableSelector(candidate.valueSource)) {
      return;
    }

    syncNodeData({ variables: [...variables, candidate] });
  };

  const removeVariable = (variableId: string) => {
    syncNodeData({ variables: variables.filter((item) => item.id !== variableId) });
  };

  return (
    <div className="space-y-0">
      <VariableAggregatorHeaderInfo
        label={node.data.label}
        variableCount={variables.length}
        outputName={outputName}
      />

      <VariableAggregatorVarList
        variables={variables}
        nodeId={node.id}
        availableNodes={availableNodes}
        nodeOutputVariables={nodeVariableList}
        onAddVariable={addVariable}
        onUpsertVariable={upsertVariable}
        onRemoveVariable={removeVariable}
      />

      <section className="space-y-3 rounded-xl bg-muted/15 px-4 py-4">
        <label className="block">
          <div className="mb-1 text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">输出变量名</div>
          <div className="rounded-lg border border-[var(--border)] bg-background p-2.5">
            <div className="mb-2 flex items-center gap-2 text-[11px] text-muted-foreground">
              <span className="inline-flex items-center rounded bg-primary/10 px-2 py-1 font-medium text-primary">
                {outputName}
              </span>
              <span className="text-muted-foreground/70">=</span>
              <span className="rounded bg-muted/50 px-2 py-1 font-medium text-foreground">string</span>
            </div>
          </div>
        </label>
      </section>
    </div>
  );
};

export default VariableAggregatorPanel;
