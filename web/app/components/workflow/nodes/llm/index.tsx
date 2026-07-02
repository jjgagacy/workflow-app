import { NodeProps } from "@xyflow/react";
import { NodeSourceHandle } from "../../components/handle/node-source-handle";
import { NodeHeader } from "../../components/nodes-shared";
import { getWorkflowModelById } from "../../components/nodes-shared/model-options";
import type { Node } from "../../types";
import { getNodeTypeIconColor } from "../../utils/node";
import type { LLMNodeData } from "./types";
import { useTranslation } from "react-i18next";
import { LLM_DEFAULT_EXCEPTION_STRATEGY } from "./data";

const LLMNode = ({ id, data }: NodeProps<Node<LLMNodeData>>) => {
  const { t } = useTranslation();
  const label = data.label?.trim() || 'LLM';
  const iconColor = data.iconColor || getNodeTypeIconColor(data.type);
  const model = getWorkflowModelById(data.modelId);
  const modelLabel = model ? `${model.provider} / ${model.name}` : t('workflow.nodes.no-selected-model');
  const enableVision = Boolean(data.enableVision);
  const retryOnFailure = Boolean(data.retryOnFailure);
  const retryCount = Math.max(1, Number(data.retryCount) || 1);
  const retryIntervalMs = Math.max(0, Number(data.retryIntervalMs) || 0);
  const exceptionStrategy = data.exceptionStrategy || LLM_DEFAULT_EXCEPTION_STRATEGY;

  return (
    <div className="llm-node relative">
      <NodeHeader icon={data.icon} iconColor={iconColor} title={label} />
      {!data.candidate && (
        <>
          <div className="space-y-2 p-4">
            <div className="rounded-lg border border-[var(--border)] bg-muted/20 px-3 py-2 text-xs text-muted-foreground">
              <div className="flex flex-wrap gap-2">
                <span className="rounded-full bg-background px-2.5 py-1">{modelLabel}</span>
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
          <NodeSourceHandle nodeId={id} handleId="output" />
        </>
      )}
    </div>
  );
};

export default LLMNode;
