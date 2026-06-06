import { NodeProps } from "@xyflow/react";
import { NodeSourceHandle } from "../../components/handle/node-source-handle";
import { NodeHeader } from "../../components/nodes-shared";
import { getWorkflowModelById } from "../../components/nodes-shared/model-options";
import type { Node } from "../../types";
import { getNodeTypeIconColor } from "../../utils/node";
import type { LLMNodeData } from "./types";

const LLMNode = ({ id, data }: NodeProps<Node<LLMNodeData>>) => {
  const label = data.label?.trim() || 'LLM';
  const iconColor = data.iconColor || getNodeTypeIconColor(data.type);
  const model = getWorkflowModelById(data.modelId);
  const modelLabel = model ? `${model.provider} / ${model.name}` : '未选择模型';
  const enableVision = Boolean(data.enableVision);
  const retryOnFailure = Boolean(data.retryOnFailure);
  const retryCount = Math.max(1, Number(data.retryCount) || 1);
  const retryIntervalMs = Math.max(0, Number(data.retryIntervalMs) || 0);
  const exceptionStrategy = data.exceptionStrategy || 'stop-execution';

  return (
    <div className="llm-node relative">
      <NodeHeader icon={data.icon} iconColor={iconColor} title={label} />
      {!data.candidate && (
        <>
          <div className="space-y-2 p-4">
            <div className="rounded-lg border border-[var(--border)] bg-muted/20 px-3 py-2 text-xs text-muted-foreground">
              <div className="flex flex-wrap gap-2">
                <span className="rounded-full bg-background px-2.5 py-1">{modelLabel}</span>
                <span className="rounded-full bg-background px-2.5 py-1">{enableVision ? '视觉已启用' : '视觉未启用'}</span>
                <span className="rounded-full bg-background px-2.5 py-1">
                  {retryOnFailure ? `失败重试 ${retryCount} 次 / ${retryIntervalMs}ms` : '失败不重试'}
                </span>
              </div>
              <div className="mt-2 truncate">
                {exceptionStrategy === 'return-default' ? '异常处理: 返回默认值' : '异常处理: 停止执行'}
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
