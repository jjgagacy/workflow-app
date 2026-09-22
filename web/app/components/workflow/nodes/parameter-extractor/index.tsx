import { NodeProps } from "@xyflow/react";
import { NodeSourceHandle } from "../../components/handle/node-source-handle";
import { NodeHeader } from "../../components/nodes-shared";
import { getNodeTypeIcon } from "../../data";
import type { Node } from "../../types";
import { getNodeTypeIconColor } from "../../utils/node";
import { DEFAULT_PARAMETER_EXTRACTOR_NAME, normalizeParameterExtractorItems } from "./data";
import type { ParameterExtractorNodeData } from "./types";
import { useTranslation } from "react-i18next";
import { useModelProviderContext } from "@/context/model-provider-context";
import { ModelIcon } from "../../components/model-picker/model-icon";
import { getClientLocale, getLocalizedText } from "@/i18n";
import { getLanguage } from "@/i18n/config";

const ParameterExtractorNode = ({ id, data }: NodeProps<Node<ParameterExtractorNodeData>>) => {
  const { t } = useTranslation();
  const label = data.label?.trim() || 'Parameter Extractor';
  const iconColor = getNodeTypeIconColor(data.type);
  const { modelProviderModels } = useModelProviderContext();
  const locale = getLanguage(getClientLocale());
  const currentProvider = modelProviderModels.find((item) => item.providerName === data.provider);
  const currentModel = currentProvider?.models.find((item) => item.model === data.modelId);
  const modelLabel = currentModel ? getLocalizedText(currentModel.label, locale) || currentModel.model : t('workflow.nodes.base.no-select-model');
  const enableVision = Boolean(data.enableVision);
  const parameters = normalizeParameterExtractorItems(data.parameters);
  const invalidDescriptionCount = parameters.filter((item) => !item.description?.trim()).length;
  const outputVariableName = data.outputVariableName?.trim() || DEFAULT_PARAMETER_EXTRACTOR_NAME;

  return (
    <div className="parameter-extractor-node relative">
      <NodeHeader icon={getNodeTypeIcon(data.type, 'h-4 w-4')} iconColor={iconColor} title={label} />

      {!data._candidate && (
        <>
          <div className="px-3 pb-3">
            <div className="rounded-lg bg-muted/20 px-3 py-1.5 space-y-0.5 text-xs">
              <div className="flex items-center gap-1">
                {currentProvider ? <ModelIcon small src={currentProvider} alt={currentProvider.providerName} /> : null}
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
          <NodeSourceHandle nodeId={id} handleId="output" className="top-1/2 -translate-y-1/2" />
        </>
      )}
    </div>
  );
};

export default ParameterExtractorNode;