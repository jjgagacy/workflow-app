import { useMemo } from "react";
import { useStoreApi } from "@xyflow/react";
import { useTranslation } from "react-i18next";
import { Checkbox } from "@/app/ui/checkbox";
import { SimpleSelect } from "@/app/ui/select";
import { NodeInput } from "../../components/base/node-input";
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
import type { Node } from "../../types";
import {
  createParameterExtractorItem,
  normalizeParameterExtractorItems,
} from "./data";
import type { ParameterExtractorItem, ParameterExtractorNodeData } from "./types";
import { ParameterExtractorInfo } from "./parameterExtractorInfo";
import ParameterList from "./parameter-list";

type ParameterExtractorPanelProps = {
  node: Node<ParameterExtractorNodeData>;
};

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
    <div className="space-y-0">
      <ParameterExtractorInfo
        label={node.data.label}
        modelLabel={model ? `${model.provider} / ${model.name}` : t('workflow.nodes.parameter-extractor.no_models')}
        parameterCount={parameters.length}
        enableVision={enableVision}
      />

      <section className="space-y-3 rounded-xl bg-muted/15 px-4 py-1">
        <div className="text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">{t('workflow.nodes.parameter-extractor.model')}</div>
        <SimpleSelect
          items={modelItems}
          defaultValue={modelId}
          allowSearch={false}
          className="w-full"
          onSelect={(item) => syncNodeData({ modelId: String(item.value) })}
        />
      </section>

      <section className="space-y-3 rounded-xl bg-muted/15 px-4 py-1">
        <div className="text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">{t('workflow.nodes.parameter-extractor.inputVariable')}</div>
        <SimpleSelect
          items={variableItems}
          defaultValue={inputVariable}
          allowSearch={false}
          className="w-full"
          onSelect={(item) => syncNodeData({ inputVariable: String(item.value) })}
        />
      </section>

      <section className="space-y-3 rounded-xl bg-muted/15 px-4 py-4">
        <div className="text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">{t('workflow.nodes.parameter-extractor.visionAbility')}</div>
        <label className="flex items-start gap-3 rounded-lg border border-[var(--border)] bg-background px-3 py-3">
          <Checkbox
            checked={enableVision}
            onChange={(event) => syncNodeData({ enableVision: event.target.checked })}
            className="mt-0.5"
          />
          <span className="min-w-0">
            <span className="block text-sm font-medium text-foreground">{t('workflow.nodes.parameter-extractor.enableVision')}</span>
            <span className="mt-1 block text-xs leading-5 text-muted-foreground">
              {t('workflow.nodes.parameter-extractor.visionAbilityDescription')}
            </span>
          </span>
        </label>
      </section>

      <ParameterList
        parameters={parameters}
        onUpsertParameter={upsertParameter}
        onRemoveParameter={removeParameter}
        onAddParameter={addParameter}
      />

      <section className="space-y-3 rounded-xl bg-muted/15 px-4 py-4">
        <label className="block">
          <div className="mb-1 text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">{t('workflow.nodes.parameter-extractor.outputVariable')}</div>
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

export default ParameterExtractorPanel;
