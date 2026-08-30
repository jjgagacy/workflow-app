import { useTranslation } from "react-i18next";
import { Checkbox } from "@/app/ui/checkbox";
import { SimpleSelect } from "@/app/ui/select";
import { NodeInput } from "../../components/base/node-input";
import { VarPicker } from "../../components/variable/var-picker";
import {
  getWorkflowModelById,
  getWorkflowModelSelectItems,
} from "../../components/nodes-shared/model-options";
import { useWorkflowStore } from "../../context";
import { useNodeConfig } from "../../hooks/use-node-config";
import { useNodesUpdate } from "../../hooks/use-nodesUpdate";
import type { Node, Variable, VariableSelector } from "../../types";
import {
  createParameterExtractorItem,
  normalizeParameterExtractorItems,
} from "./data";
import type { ParameterExtractorItem, ParameterExtractorNodeData } from "./types";
import { ParameterExtractorInfo } from "./parameterExtractorInfo";
import ParameterList from "./parameter-list";
import { DEFAULT_OUTPUT_VARIABLE_NAME } from "../document-extractor/data";

type ParameterExtractorPanelProps = {
  node: Node<ParameterExtractorNodeData>;
};

const ParameterExtractorPanel = ({ node }: ParameterExtractorPanelProps) => {
  const { t } = useTranslation();
  const updateActivePanelNode = useWorkflowStore((state) => state.updateActivePanelNode);
  const { availableNodes, nodeVariableList } = useNodeConfig(node.id);
  const { onNodeDataUpdate } = useNodesUpdate();

  const modelId = node.data.modelId ?? '';
  const inputVariable = node.data.inputVariable;
  const enableVision = Boolean(node.data.enableVision);
  const parameters = normalizeParameterExtractorItems(node.data.parameters);
  const outputVariableName = node.data.outputVariableName ?? DEFAULT_OUTPUT_VARIABLE_NAME;
  const model = getWorkflowModelById(modelId);
  const outputFields = [
    ...parameters
      .filter((parameter) => parameter.name.trim())
      .map((parameter) => ({
        name: parameter.name.trim(),
        description: parameter.description.trim() || t('workflow.nodes.parameter-extractor.outputFieldDescriptionFallback'),
      })),
    { name: '_isSuccess', description: t('workflow.nodes.parameter-extractor.outputFieldIsSuccess') },
    { name: '_errorMessage', description: t('workflow.nodes.parameter-extractor.outputFieldErrorMessage') },
    { name: '_usage', description: t('workflow.nodes.parameter-extractor.outputFieldUsage') },
  ];

  const modelItems = getWorkflowModelSelectItems();

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

  const handleInputVariableChange = (_variable: Variable, selector: VariableSelector) => {
    syncNodeData({ inputVariable: selector });
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
        <VarPicker
          nodeId={node.id}
          value={inputVariable}
          onChange={handleInputVariableChange}
          availableNodes={availableNodes}
          nodeOutputVariables={nodeVariableList}
          className="w-full"
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
        <div className="block">
          <div className="mb-2 text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">{t('workflow.nodes.parameter-extractor.outputVariable')}</div>

          <div className="rounded-lg border border-[var(--border)] bg-background p-2.5">
            <div className="mb-2 flex items-center gap-2 text-[11px] text-muted-foreground">
              <span className="inline-flex items-center rounded bg-primary/10 px-2 py-1 font-medium text-primary">
                {outputVariableName}
              </span>
              <span className="text-muted-foreground/70">=</span>
              <span className="rounded bg-muted/50 px-2 py-1 font-medium text-foreground">object</span>
            </div>

            <div className="rounded-md border border-dashed border-[var(--border)] bg-muted/20 p-2">
              <div className="mb-2 text-[10px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
                {t('workflow.nodes.parameter-extractor.outputFields')}
              </div>
              <div className="space-y-2">
                {outputFields.map((field) => (
                  <div
                    key={field.name}
                    className="rounded-md border border-[var(--border)] bg-background px-2 py-1.5"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-[11px] font-medium text-foreground">{field.name}</span>
                      <span className="text-[9px] text-muted-foreground">{field.description}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ParameterExtractorPanel;
