import { NodeProps } from "@xyflow/react";
import { NodeSourceHandle } from "../../components/handle/node-source-handle";
import { NodeHeader } from "../../components/nodes-shared";
import { getNodeTypeIcon } from "../../data";
import type { Node } from "../../types";
import { getNodeTypeIconColor } from "../../utils/node";
import type { LLMNodeData } from "./types";
import { useTranslation } from "react-i18next";
import { LLM_DEFAULT_EXCEPTION_STRATEGY } from "./data";
import { useModelProviderContext } from "@/context/model-provider-context";
import { ModelIcon } from "../../components/model-picker/model-icon";
import { getClientLocale, getLocalizedText } from "@/i18n";
import { getLanguage } from "@/i18n/config";

const LLMNode = ({ id, data }: NodeProps<Node<LLMNodeData>>) => {
  const { t } = useTranslation();
  const label = data.label?.trim() || 'LLM';
  const iconColor = getNodeTypeIconColor(data.type);
  const { modelProviderModels } = useModelProviderContext();
  const locale = getLanguage(getClientLocale());
  const modelId = data.modelId;
  const provider = data.provider;

  const currentProvider = modelProviderModels.find((item) => item.providerName === provider);
  const currentModel = currentProvider?.models.find((item) => item.model === modelId);
  const modelLabel = currentModel ? getLocalizedText(currentModel.label, locale) || currentModel.model : t('workflow.nodes.no-selected-model');

  const enableVision = Boolean(data.enableVision);
  const retryOnFailure = Boolean(data.retryOnFailure);
  const retryCount = Math.max(1, Number(data.retryCount) || 1);
  const retryIntervalMs = Math.max(0, Number(data.retryIntervalMs) || 0);
  const exceptionStrategy = data.exceptionStrategy || LLM_DEFAULT_EXCEPTION_STRATEGY;

  return (
    <div className="llm-node relative">
      <NodeHeader icon={getNodeTypeIcon(data.type, 'h-4 w-4')} iconColor={iconColor} title={label} />
      {!data._candidate && (
        <>
          <div className="space-y-2 p-4">
            <div className="rounded-lg border border-[var(--border)] bg-muted/20 px-3 py-2 text-xs text-muted-foreground">
              <div className="flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-2 rounded-full bg-background px-2.5 py-1">
                  {currentProvider ? <ModelIcon small src={currentProvider} alt={currentProvider.providerName} /> : null}
                  <span>{modelLabel}</span>
                </span>
                <span className="rounded-full bg-background px-2.5 py-1">{enableVision ? t('workflow.nodes.llm.visionEnabled') : t('workflow.nodes.llm.visionDisabled')}</span>
                <span className="rounded-full bg-background px-2.5 py-1">
                  {retryOnFailure ? t('workflow.nodes.llm.retryOnFailure', { count: retryCount, interval: retryIntervalMs }) : t('workflow.nodes.llm.retryOnFailure', { count: 0, interval: 0 })}
                </span>
              </div>
              <div className="mt-2 truncate">
                {exceptionStrategy === 'return-default' ? t('workflow.nodes.llm.exceptionReturnDefault') : t('workflow.nodes.llm.exceptionStopExecution')}
              </div>
            </div>
          </div>
          <NodeSourceHandle nodeId={id} handleId="output" className="top-1/2 -translate-y-1/2" />
        </>
      )}
    </div>
  );
};

export default LLMNode;
