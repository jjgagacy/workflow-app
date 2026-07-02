import { NodeProps } from "@xyflow/react";
import { NodeSourceHandle } from "../../components/handle/node-source-handle";
import { NodeHeader } from "../../components/nodes-shared";
import { getWorkflowModelById } from "../../components/nodes-shared/model-options";
import type { Node } from "../../types";
import { getNodeTypeIconColor } from "../../utils/node";
import { DEFAULT_PARAMETER_EXTRACTOR_NAME, normalizeParameterExtractorItems } from "./data";
import type { ParameterExtractorNodeData } from "./types";
import { useTranslation } from "react-i18next";

const ParameterExtractorNode = ({ id, data }: NodeProps<Node<ParameterExtractorNodeData>>) => {
  const { t } = useTranslation();
  const label = data.label?.trim() || 'Parameter Extractor';
  const iconColor = data.iconColor || getNodeTypeIconColor(data.type);
  const model = getWorkflowModelById(data.modelId);
  const modelLabel = model ? `${model.provider} / ${model.name}` : t('workflow.nodes.base.no-select-model');
  const enableVision = Boolean(data.enableVision);
  const parameters = normalizeParameterExtractorItems(data.parameters);
  const invalidDescriptionCount = parameters.filter((item) => !item.description?.trim()).length;
  const outputVariableName = data.outputVariableName?.trim() || DEFAULT_PARAMETER_EXTRACTOR_NAME;

  return (
    <div className="parameter-extractor-node relative">
      <NodeHeader icon={data.icon} iconColor={iconColor} title={label} />

      {!data.candidate && (
        <>
          <div className="px-3 pb-3">
            <div className="rounded-lg bg-muted/20 px-3 py-1.5 space-y-0.5 text-xs">
              <div className="flex items-center gap-1">
                <span className="truncate text-foreground">{modelLabel}</span>
              </div>
              <div className="flex items-center gap-1 text-muted-foreground">
                <span className="font-medium text-foreground">{parameters.length}</span>
                <span>{t('workflow.nodes.parameter-extractor.parameters')}</span>
                <span className="text-muted-foreground/20">·</span>
                <span>{enableVision ? t('workflow.nodes.parameter-extractor.vision') : t('workflow.nodes.parameter-extractor.no_vision')}</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="font-mono text-foreground">{outputVariableName}</span>
                {invalidDescriptionCount > 0 && (
                  <span className="text-destructive">⚠️{invalidDescriptionCount}</span>
                )}
              </div>
            </div>
          </div>
          <NodeSourceHandle nodeId={id} handleId="output" />
        </>
      )}
    </div>
  );
};

export default ParameterExtractorNode;