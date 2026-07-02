import { useMemo } from "react";
import { useStoreApi } from "@xyflow/react";
import { useTranslation } from "react-i18next";
import { NodeInput } from "../../components/base/node-input";
import { buildWorkflowVariableOptions } from "../../components/nodes-shared/variable-select";
import { useNodesUpdate } from "../../hooks/use-nodesUpdate";
import { useWorkflowStore } from "../../context";
import { Node } from "../../types";
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
  const storeApi = useStoreApi();
  const updateActivePanelNode = useWorkflowStore((state) => state.updateActivePanelNode);
  const chatEnvVariables = useWorkflowStore((state) => state.chatEnvVariables);
  const envVariables = useWorkflowStore((state) => state.envVariables);
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

  const variableOptions = useMemo(() => {
    const nodes = storeApi.getState().nodes as Node[];
    return buildWorkflowVariableOptions({
      t,
      nodeId: node.id,
      nodes,
      envVariables,
      chatEnvVariables,
    });
  }, [chatEnvVariables, envVariables, node.id, storeApi, t]);

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
    <div className="space-y-0">
      <VariableAggregatorHeaderInfo
        label={node.data.label}
        variableCount={variables.length}
        outputName={outputName}
      />

      <VariableAggregatorVarList
        variables={variables}
        variableOptions={variableOptions}
        onAddVariable={addVariable}
        onUpsertVariable={upsertVariable}
        onRemoveVariable={removeVariable}
      />

      <section className="space-y-3 rounded-xl bg-muted/15 px-4 py-4">
        <label className="block">
          <div className="mb-1 text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">输出变量名</div>
          <NodeInput
            value={outputName}
            onChange={(event) => syncNodeData({ outputName: event.target.value })}
            placeholder="eg: aggregated"
          />
        </label>
      </section>
    </div>
  );
};

export default VariableAggregatorPanel;
